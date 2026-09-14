// Multi-Channel Emergency SMS Dispatch Gateway
// Supports Fast2SMS (India Gov DLT), Twilio, and Console/Audit Logging

export async function dispatchEmergencySms({ recipients, vehiclePlate, coordinates, severity, bloodGroup, nearestHospital }) {
  const gmapsUrl = `https://maps.google.com/?q=${coordinates.lat},${coordinates.lng}`;
  const message = `[ASAAS CRITICAL ALERT] Vehicle ${vehiclePlate} has suffered a ${severity} collision at ${coordinates.lat.toFixed(4)}N, ${coordinates.lng.toFixed(4)}E. Blood Req: ${bloodGroup || 'Unknown'}. Nearest Facility: ${nearestHospital || 'AIIMS Trauma'}. Live Track: ${gmapsUrl}`;

  const results = [];

  for (const contact of recipients) {
    console.log(`[SMS-GATEWAY] Dispatching Emergency SMS to ${contact.name} (${contact.phone})...`);

    // 1. Check if Fast2SMS API Key is present in environment
    if (process.env.FAST2SMS_API_KEY) {
      try {
        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': process.env.FAST2SMS_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            route: 'q',
            message: message,
            numbers: contact.phone.replace(/[^0-9]/g, '')
          })
        });
        const resData = await response.json();
        results.push({ phone: contact.phone, status: 'SENT_FAST2SMS', details: resData });
        continue;
      } catch (err) {
        console.error(`[SMS-GATEWAY] Fast2SMS Error for ${contact.phone}:`, err);
      }
    }

    // 2. Check if Twilio is configured
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      try {
        const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
        const body = new URLSearchParams({
          From: process.env.TWILIO_PHONE_NUMBER,
          To: contact.phone,
          Body: message
        });

        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: body.toString()
        });
        const twilioData = await response.json();
        results.push({ phone: contact.phone, status: 'SENT_TWILIO', sid: twilioData.sid });
        continue;
      } catch (err) {
        console.error(`[SMS-GATEWAY] Twilio Error for ${contact.phone}:`, err);
      }
    }

    // 3. Fallback: Log to Audit Record & Console
    console.log(`[SMS-GATEWAY] [SIMULATED_CARRIER_DISPATCH] To: ${contact.phone} -> "${message}"`);
    results.push({
      phone: contact.phone,
      status: 'DISPATCHED_SIMULATOR',
      timestamp: new Date().toISOString(),
      preview: message
    });
  }

  return results;
}
