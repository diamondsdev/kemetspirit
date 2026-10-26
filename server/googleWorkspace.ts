// Server-side helper module for Google Workspace (Sheets, Drive, Gmail)


export interface BookingData {
  id: string;
  excursionId: string;
  excursionTitle: string;
  travelerName: string;
  travelerEmail: string;
  date: string;
  numberOfGuests: number;
  totalCost: number;
  specialRequests?: string;
  status: string;
  createdAt: string;
}

// 1. Get or Target "Kemet Bookings" Spreadsheet in Google Drive
const KEMET_BOOKINGS_TARGET_SPREADSHEET_ID = "1vQAEg1__HMM-joA-FJrf7hxpZU5R52-GpOvkgV8IPIo";

export async function getOrCreateKemetBookingsSheet(accessToken: string): Promise<string> {
  const authHeader = accessToken.startsWith('Bearer ') ? accessToken : `Bearer ${accessToken}`;

  // Try provided Kemet Bookings sheet ID first
  const checkUrl = `https://sheets.googleapis.com/v4/spreadsheets/${KEMET_BOOKINGS_TARGET_SPREADSHEET_ID}?fields=spreadsheetId`;
  const checkRes = await fetch(checkUrl, {
    headers: { Authorization: authHeader }
  });

  if (checkRes.ok) {
    return KEMET_BOOKINGS_TARGET_SPREADSHEET_ID;
  }

  // Search for existing file named "Kemet Bookings" in user's Drive
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='Kemet Bookings' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`;
  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: authHeader }
  });

  if (searchRes.ok) {
    const searchData: any = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }
  } else {
    const errText = await searchRes.text();
    console.warn("Drive search error:", errText);
  }

  // Fallback: Create new spreadsheet file
  const createUrl = `https://www.googleapis.com/drive/v3/files`;
  const createRes = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Kemet Bookings',
      mimeType: 'application/vnd.google-apps.spreadsheet'
    })
  });

  if (!createRes.ok) {
    const createErr = await createRes.text();
    throw new Error(`Failed to create Kemet Bookings spreadsheet: ${createErr}`);
  }

  const newFileData: any = await createRes.json();
  return newFileData.id;
}

// Ensure header row exists in the targeted spreadsheet
async function ensureSheetHeaders(authHeader: string, spreadsheetId: string) {
  try {
    const getValUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:J1`;
    const getRes = await fetch(getValUrl, { headers: { Authorization: authHeader } });
    if (getRes.ok) {
      const data: any = await getRes.json();
      if (data.values && data.values.length > 0 && data.values[0].length > 0) {
        return; // Headers already present
      }
    }
  } catch (e) {
    console.warn("Header check warning:", e);
  }

  // Write headers to A1:J1
  const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:J1?valueInputOption=USER_ENTERED`;
  await fetch(updateUrl, {
    method: 'PUT',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [
        [
          "Booking ID",
          "Excursion Title",
          "Traveler Name",
          "Traveler Email",
          "Date",
          "Guests",
          "Total Cost ($)",
          "Status",
          "Special Requests",
          "Created At"
        ]
      ]
    })
  });
}

// 2. Append Booking Record to "Kemet Bookings" Sheet
export async function appendBookingToSheet(accessToken: string, booking: BookingData): Promise<string> {
  const authHeader = accessToken.startsWith('Bearer ') ? accessToken : `Bearer ${accessToken}`;
  const spreadsheetId = await getOrCreateKemetBookingsSheet(accessToken);

  // Ensure header row is set if the spreadsheet is blank
  await ensureSheetHeaders(authHeader, spreadsheetId);

  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:J1:append?valueInputOption=USER_ENTERED`;
  const appendRes = await fetch(appendUrl, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [
        [
          booking.id,
          booking.excursionTitle,
          booking.travelerName,
          booking.travelerEmail,
          booking.date,
          booking.numberOfGuests,
          booking.totalCost,
          booking.status,
          booking.specialRequests || 'None',
          booking.createdAt
        ]
      ]
    })
  });

  if (!appendRes.ok) {
    const errText = await appendRes.text();
    throw new Error(`Failed to append booking row to Google Sheet (${spreadsheetId}): ${errText}`);
  }

  return spreadsheetId;
}

// 3. Send Email via Gmail API v1
export async function sendGmailMessage(
  accessToken: string,
  to: string,
  subject: string,
  htmlBody: string
): Promise<boolean> {
  const authHeader = accessToken.startsWith('Bearer ') ? accessToken : `Bearer ${accessToken}`;

  const mimeParts = [
    `To: ${to}`,
    `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    ``,
    htmlBody
  ];

  const rawMime = mimeParts.join('\r\n');
  const base64Url = Buffer.from(rawMime, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const sendUrl = `https://gmail.googleapis.com/v1/users/me/messages/send`;
  const sendRes = await fetch(sendUrl, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: base64Url })
  });

  if (!sendRes.ok) {
    const errText = await sendRes.text();
    console.error(`Gmail API send error to ${to}:`, errText);
    throw new Error(`Gmail API error: ${errText}`);
  }

  return true;
}

// 3b. Send Newsletter Welcome Email Template
export async function sendNewsletterWelcomeEmail(
  accessToken: string | undefined,
  subscriberEmail: string,
  promoCode: string,
  interests: string[] = []
): Promise<{ emailSent: boolean; error?: string }> {
  const subject = `𓋹 Sacred Scroll Invitation: Welcome to Kemet Royal Excursions! (Your 30% Promo Code Inside)`;
  const htmlBody = `
    <div style="font-family: 'Georgia', serif; background-color: #120e0a; color: #e6c280; padding: 32px; border-radius: 16px; border: 2px solid #d4af37; max-width: 620px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 36px; color: #d4af37;">𓋹 𓂀 𓇛</span>
        <h1 style="color: #d4af37; text-transform: uppercase; letter-spacing: 3px; font-size: 22px; margin: 10px 0 4px 0;">Kemet Royal Excursions</h1>
        <p style="color: #a89270; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0;">Sacred Scrolls & Royal Expedition Digest</p>
      </div>

      <p style="font-size: 15px; line-height: 1.7; color: #f0e2cc;">
        Greetings, Noble Explorer,
      </p>
      <p style="font-size: 14px; line-height: 1.7; color: #d1c2a5;">
        The Royal Scribe Sennedjem has inscribed your name into the sacred scrolls of Kemet. You are now officially part of our inner circle of travelers, granting you priority access to seasonal voyages, private yacht charters, and deep desert safaris.
      </p>

      <!-- PROMO CODE BOX -->
      <div style="background: linear-gradient(135deg, #1f1710 0%, #2a1f15 100%); padding: 20px; border-radius: 12px; border: 1px solid #d4af37; text-align: center; margin: 24px 0;">
        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #a89270; display: block; margin-bottom: 6px;">Your Royal 30% Discount Code</span>
        <div style="font-family: monospace; font-size: 22px; font-weight: bold; color: #ffd700; letter-spacing: 3px; background-color: #120e0a; padding: 10px 16px; border-radius: 8px; border: 1px dashed #d4af37; display: inline-block;">
          ${promoCode}
        </div>
        <p style="font-size: 11px; color: #a89270; margin-top: 8px; margin-bottom: 0;">Apply this promo code during excursion reservation to claim your 30% offering discount.</p>
      </div>

      <!-- FEATURED VOYAGES -->
      <h3 style="color: #d4af37; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid #3d2f21; padding-bottom: 8px; margin-top: 28px;">
        𓊟 Curated Royal Voyages
      </h3>
      <ul style="font-size: 13px; color: #c9b89c; line-height: 1.8; padding-left: 20px;">
        <li><strong style="color: #e6c280;">Ras Mohammed Royal Coral Diving:</strong> Scuba dive in Nun's deep turquoise waters alongside submerged Pharaonic statues.</li>
        <li><strong style="color: #e6c280;">Set's Golden Deshret Safari:</strong> Quad bike racing over red dunes, camel treks, and telescope stargazing in Bedouin oases.</li>
        <li><strong style="color: #e6c280;">Pharaoh's Pilgrimage to Waset (Luxor):</strong> VIP entry into the Valley of the Kings, Karnak Temple, and private Nile feluccas.</li>
      </ul>

      <p style="color: #d4af37; font-style: italic; text-align: center; margin-top: 28px; font-size: 13px;">
        "May Ra guide your steps, and may the waters of the Nile bring eternal peace to your journeys."
      </p>

      <hr style="border: 0; border-top: 1px solid #332414; margin-top: 28px; margin-bottom: 16px;" />
      <p style="font-size: 10px; color: #7a6854; text-align: center; text-transform: uppercase; letter-spacing: 1px; margin: 0;">
        Kemet Excursions • Red Sea Coast & Ancient Monuments • Egypt
      </p>
    </div>
  `;

  if (accessToken) {
    try {
      await sendGmailMessage(accessToken, subscriberEmail, subject, htmlBody);
      return { emailSent: true };
    } catch (err: any) {
      console.warn("Could not send welcome email via Gmail API:", err.message);
      return { emailSent: false, error: err.message };
    }
  }

  return { emailSent: false, error: "Saved to database ledger." };
}

// 4. Helper to send both Customer Confirmation and Agency Notification
export async function processBookingEmailsAndSheet(
  accessToken: string | undefined,
  booking: BookingData
): Promise<{ sheetSynced: boolean; emailsSent: boolean; error?: string }> {
  let sheetSynced = false;
  let emailsSent = false;
  let errorMsg = '';

  if (!accessToken) {
    return {
      sheetSynced: false,
      emailsSent: false,
      error: "No Google Workspace access token provided. User should Sign in with Google to enable automatic Sheet and Gmail sync."
    };
  }

  // A. Save to Google Sheet "Kemet Bookings"
  try {
    await appendBookingToSheet(accessToken, booking);
    sheetSynced = true;
  } catch (err: any) {
    console.error("Sheet sync failed:", err);
    errorMsg += `Sheet sync: ${err.message}. `;
  }

  // B. Customer Email Body
  const customerSubject = `𓋹 Sacred Booking Confirmation: ${booking.excursionTitle}`;
  const customerHtml = `
    <div style="font-family: 'Georgia', serif; background-color: #140f0a; color: #e6c280; padding: 28px; border-radius: 12px; border: 1px solid #d4af37; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #d4af37; text-transform: uppercase; letter-spacing: 2px; text-align: center; font-size: 20px;">𓋹 Kemet Royal Excursions 𓋹</h1>
      <p style="font-size: 14px; line-height: 1.6;">Greetings, Noble Traveler <strong>${booking.travelerName}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6;">The stars of Nut have aligned, and Sennedjem the Royal Scribe has recorded your journey into the golden ledger of Kemet.</p>
      
      <div style="background-color: #1f1710; padding: 18px; border-left: 4px solid #d4af37; margin: 20px 0; font-size: 13px; line-height: 1.8;">
        <p style="margin: 4px 0;"><strong style="color: #d4af37;">Booking Ref ID:</strong> ${booking.id}</p>
        <p style="margin: 4px 0;"><strong style="color: #d4af37;">Excursion:</strong> ${booking.excursionTitle}</p>
        <p style="margin: 4px 0;"><strong style="color: #d4af37;">Scheduled Date:</strong> ${booking.date}</p>
        <p style="margin: 4px 0;"><strong style="color: #d4af37;">Travelers / Guests:</strong> ${booking.numberOfGuests}</p>
        <p style="margin: 4px 0;"><strong style="color: #d4af37;">Total Offering:</strong> $${booking.totalCost}</p>
        <p style="margin: 4px 0;"><strong style="color: #d4af37;">Special Requests:</strong> ${booking.specialRequests || 'None'}</p>
        <p style="margin: 4px 0;"><strong style="color: #d4af37;">Status:</strong> ${booking.status}</p>
      </div>

      <p style="font-size: 13px; line-height: 1.6;">Our High Priests and desert guide captains await your arrival on the sacred grounds of Kemet.</p>
      <p style="color: #d4af37; font-style: italic; text-align: center; margin-top: 20px;">"May the sun god Ra illuminate your path and Nun's waters protect your spirit."</p>
      <hr style="border-color: #332414; margin-top: 24px;" />
      <p style="font-size: 10px; color: #887258; text-align: center; text-transform: uppercase; letter-spacing: 1px;">Kemet Excursions • Red Sea & Desert Safaris • Egypt</p>
    </div>
  `;

  // C. Agency Notification Email Body (to kemettoursagency@gmail.com)
  const agencySubject = `🚨 New AI Assistant Booking: ${booking.excursionTitle} (${booking.travelerName})`;
  const agencyHtml = `
    <div style="font-family: sans-serif; background-color: #ffffff; color: #222222; padding: 24px; border-radius: 8px; border: 1px solid #e0e0e0; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0b57d0; margin-top: 0; font-size: 18px;">New AI Assistant Reservation Received</h2>
      <p style="font-size: 14px; color: #555;">A new excursion reservation was completed through the Kemet Portal and recorded into your <strong>Kemet Bookings</strong> Google Sheet.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px;">
        <tr style="background-color: #f8f9fa;"><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eeeeee; width: 140px;">Booking ID</td><td style="padding: 10px; border-bottom: 1px solid #eeeeee;">${booking.id}</td></tr>
        <tr><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eeeeee;">Excursion Title</td><td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #0b57d0; font-weight: bold;">${booking.excursionTitle}</td></tr>
        <tr style="background-color: #f8f9fa;"><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eeeeee;">Traveler Name</td><td style="padding: 10px; border-bottom: 1px solid #eeeeee;">${booking.travelerName}</td></tr>
        <tr><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eeeeee;">Traveler Email</td><td style="padding: 10px; border-bottom: 1px solid #eeeeee;"><a href="mailto:${booking.travelerEmail}">${booking.travelerEmail}</a></td></tr>
        <tr style="background-color: #f8f9fa;"><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eeeeee;">Scheduled Date</td><td style="padding: 10px; border-bottom: 1px solid #eeeeee;">${booking.date}</td></tr>
        <tr><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eeeeee;">Guests</td><td style="padding: 10px; border-bottom: 1px solid #eeeeee;">${booking.numberOfGuests}</td></tr>
        <tr style="background-color: #f8f9fa;"><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eeeeee;">Total Cost</td><td style="padding: 10px; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #2e7d32;">$${booking.totalCost}</td></tr>
        <tr><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eeeeee;">Special Requests</td><td style="padding: 10px; border-bottom: 1px solid #eeeeee;">${booking.specialRequests || 'None'}</td></tr>
        <tr style="background-color: #f8f9fa;"><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eeeeee;">Booked Via</td><td style="padding: 10px; border-bottom: 1px solid #eeeeee;">Sennedjem AI Scribe / Kemet Portal</td></tr>
      </table>

      <div style="margin-top: 20px; padding: 12px; background-color: #e8f0fe; border-radius: 6px; font-size: 12px; color: #1967d2;">
        ✓ Saved to <strong>Kemet Bookings</strong> Google Sheet<br />
        ✓ Confirmation email dispatched to traveler (${booking.travelerEmail})
      </div>
    </div>
  `;

  try {
    // Send email 1: to customer
    await sendGmailMessage(accessToken, booking.travelerEmail, customerSubject, customerHtml);

    // Send email 2: to agency email
    await sendGmailMessage(accessToken, 'kemettoursagency@gmail.com', agencySubject, agencyHtml);

    emailsSent = true;
  } catch (err: any) {
    console.error("Gmail send failed:", err);
    errorMsg += `Gmail error: ${err.message}. `;
  }

  return {
    sheetSynced,
    emailsSent,
    error: errorMsg || undefined
  };
}
