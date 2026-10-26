// Google Sheets API Service Client

interface SyncData {
  bookings: any[];
  subscribers: any[];
  excursions: any[];
  crmProfiles: any[];
  oracleLogs: any[];
}

/**
 * Creates a new Google Spreadsheet titled "Kemet Tours - Sacred Royal Ledger"
 * with separate sheet tabs for each dataset.
 */
export async function createKemetSpreadsheet(token: string): Promise<{ id: string; url: string }> {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: 'Kemet Tours - Sacred Royal Ledger 𓉐',
      },
      sheets: [
        { properties: { title: 'Bookings' } },
        { properties: { title: 'Subscribers' } },
        { properties: { title: 'Excursions' } },
        { properties: { title: 'Traveler CRM' } },
        { properties: { title: 'Oracle Logs' } },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to create spreadsheet: ${errText}`);
  }

  const data = await response.json();
  return {
    id: data.spreadsheetId,
    url: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
  };
}

/**
 * Overwrites the data in the specified Google Spreadsheet tabs with the current application state.
 */
export async function syncTablesToSpreadsheet(
  token: string,
  spreadsheetId: string,
  data: SyncData
): Promise<void> {
  const valueInputOption = 'USER_ENTERED';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;

  // 1. Prepare Bookings rows
  const bookingsHeaders = [
    'Booking ID',
    'Excursion ID',
    'Excursion Title',
    'Traveler Name',
    'Traveler Email',
    'Date',
    'Guests',
    'Total Cost ($)',
    'Status',
    'Created At',
  ];
  const bookingsRows = data.bookings.map((b) => [
    b.id || '',
    b.excursionId || '',
    b.excursionTitle || '',
    b.travelerName || '',
    b.travelerEmail || '',
    b.date || '',
    b.numberOfGuests || 1,
    b.totalCost || 0,
    b.status || '',
    b.createdAt || '',
  ]);

  // 2. Prepare Subscribers rows
  const subscribersHeaders = ['Subscriber ID', 'Email Address', 'Interests', 'Priest Tier', 'Signup Date', 'Promo Code'];
  const subscribersRows = data.subscribers.map((s) => [
    s.id || '',
    s.email || '',
    (s.interests || []).join(', '),
    s.tier || '',
    s.signupDate || '',
    s.promoCode || '',
  ]);

  // 3. Prepare Excursions rows
  const excursionsHeaders = [
    'Excursion ID',
    'Title',
    'Tagline',
    'Category',
    'Duration',
    'Price ($)',
    'Rating',
    'Location',
    'Description',
    'Ancient Lore',
    'Image URL',
    'Inclusions',
    'Highlights',
  ];
  const excursionsRows = data.excursions.map((e) => [
    e.id || '',
    e.title || '',
    e.tagline || '',
    e.category || '',
    e.duration || '',
    e.price || 0,
    e.rating || 5,
    e.location || '',
    e.description || '',
    e.ancientLore || '',
    e.image || '',
    (e.inclusions || []).join('; '),
    (e.highlights || []).join('; '),
  ]);

  // 4. Prepare Traveler CRM rows
  const crmHeaders = [
    'Profile ID',
    'Full Name',
    'Email Address',
    'VIP Tier',
    'Lead Status',
    'Total Spend ($)',
    'Last Active',
    'Inquiries Count',
    'Scribe Notes',
  ];
  const crmRows = data.crmProfiles.map((p) => [
    p.id || '',
    p.name || '',
    p.email || '',
    p.vipTier || '',
    p.leadStatus || '',
    p.totalSpend || 0,
    p.lastActive || '',
    p.inquiriesCount || 0,
    p.scribeNotes || '',
  ]);

  // 5. Prepare Oracle Logs rows
  const oracleHeaders = ['Log ID', 'Name / Guest', 'Email Address', 'Query Asked', 'Time Sent'];
  const oracleRows = data.oracleLogs.map((l) => [
    l.id || '',
    l.name || '',
    l.email || '',
    l.query || '',
    l.time || '',
  ]);

  const valueRanges = [
    {
      range: 'Bookings!A1:J1000',
      values: [bookingsHeaders, ...bookingsRows],
    },
    {
      range: 'Subscribers!A1:F1000',
      values: [subscribersHeaders, ...subscribersRows],
    },
    {
      range: 'Excursions!A1:M1000',
      values: [excursionsHeaders, ...excursionsRows],
    },
    {
      range: 'Traveler CRM!A1:I1000',
      values: [crmHeaders, ...crmRows],
    },
    {
      range: 'Oracle Logs!A1:E1000',
      values: [oracleHeaders, ...oracleRows],
    },
  ];

  // Send batch update of cell values
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption,
      data: valueRanges,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to batch update sheet values: ${errText}`);
  }

  // Optionally style spreadsheet headers with batchUpdate spreadsheet requests
  try {
    await applySacredStyling(token, spreadsheetId);
  } catch (styleErr) {
    console.warn('Could not apply styled borders/colors to Google Sheet, values synced successfully:', styleErr);
  }
}

/**
 * Applies a gorgeous Royal Kemet theme style (Golden text on dark header rows, frozen headers)
 * to make the synchronized spreadsheet look highly polished and premium!
 */
async function applySacredStyling(token: string, spreadsheetId: string): Promise<void> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
  
  // First, fetch sheet IDs to target styling correctly
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!metaRes.ok) return;
  const metaData = await metaRes.json();
  const sheets = metaData.sheets || [];

  const requests = [];

  for (const sheet of sheets) {
    const sheetId = sheet.properties.sheetId;
    
    // 1. Freeze the first row
    requests.push({
      updateSheetProperties: {
        properties: {
          sheetId,
          gridProperties: {
            frozenRowCount: 1,
          },
        },
        fields: 'gridProperties.frozenRowCount',
      },
    });

    // 2. Format row 1 headers (Background: Dark #18120d, Text: Gold #D4AF37, Bold, Centered)
    requests.push({
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: 14,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: {
              red: 0.09,
              green: 0.07,
              blue: 0.05,
            },
            textFormat: {
              foregroundColor: {
                red: 0.83,
                green: 0.69,
                blue: 0.22,
              },
              bold: true,
              fontSize: 10,
              fontFamily: 'Consolas',
            },
            horizontalAlignment: 'CENTER',
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
      },
    });

    // 3. Auto-fit column sizes for comfortable reading
    requests.push({
      autoResizeDimensions: {
        dimensions: {
          sheetId,
          dimension: 'COLUMNS',
          startIndex: 0,
          endIndex: 14,
        },
      },
    });
  }

  await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });
}

/**
 * Reads and parses Excursion price edits and title updates back from Google Sheets.
 * Allows updating catalog excursions from the spreadsheet!
 */
export async function importExcursionsFromSpreadsheet(
  token: string,
  spreadsheetId: string
): Promise<any[]> {
  const range = 'Excursions!A2:M100'; // Fetch all 13 columns up to Highlights (M)
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to import excursions: ${errText}`);
  }

  const data = await response.json();
  const rows = data.values || [];

  return rows.map((row: any) => {
    const inclusionsRaw = row[11] || '';
    const highlightsRaw = row[12] || '';
    return {
      id: row[0],
      title: row[1],
      tagline: row[2],
      category: row[3],
      duration: row[4],
      price: Number(row[5]) || 0,
      rating: Number(row[6]) || 5,
      location: row[7],
      description: row[8] || '',
      ancientLore: row[9] || '',
      image: row[10] || '',
      inclusions: inclusionsRaw ? inclusionsRaw.split(';').map((s: string) => s.trim()).filter(Boolean) : [],
      highlights: highlightsRaw ? highlightsRaw.split(';').map((s: string) => s.trim()).filter(Boolean) : []
    };
  }).filter((e: any) => e.id);
}

/**
 * Reads and parses Booking status updates back from Google Sheets.
 * Allows High Priests to approve/cancel bookings inside the sheet, then import them back!
 */
export async function importBookingsFromSpreadsheet(
  token: string,
  spreadsheetId: string
): Promise<any[]> {
  const range = 'Bookings!A2:I200'; // Column I is Status, Column A is ID
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to import bookings: ${errText}`);
  }

  const data = await response.json();
  const rows = data.values || [];

  return rows.map((row: any) => ({
    id: row[0],
    excursionId: row[1],
    excursionTitle: row[2],
    travelerName: row[3],
    travelerEmail: row[4],
    date: row[5],
    numberOfGuests: Number(row[6]) || 1,
    totalCost: Number(row[7]) || 0,
    status: row[8],
  })).filter((b: any) => b.id);
}

/**
 * Creates a new spreadsheet for the traveler's bookings and populates it.
 */
export async function exportUserBookingsToNewSheet(token: string, bookings: any[]): Promise<{ id: string; url: string }> {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: 'My Kemet Tours - Booked Expeditions 𓎬',
      },
      sheets: [
        { properties: { title: 'My Bookings' } },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to create spreadsheet: ${errText}`);
  }

  const spreadsheet = await response.json();
  const spreadsheetId = spreadsheet.spreadsheetId;
  const spreadsheetUrl = spreadsheet.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Now populate with bookings
  const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;
  const bookingsHeaders = [
    'Booking ID',
    'Excursion Title',
    'Traveler Name',
    'Traveler Email',
    'Date',
    'Guests',
    'Total Cost ($)',
    'Status',
    'Special Requests',
  ];

  const bookingsRows = bookings.map((b) => [
    b.id || '',
    b.excursionTitle || '',
    b.travelerName || '',
    b.travelerEmail || '',
    b.date || '',
    b.numberOfGuests || 1,
    b.totalCost || 0,
    b.status || '',
    b.specialRequests || '',
  ]);

  const valueInputOption = 'USER_ENTERED';
  const valueRanges = [
    {
      range: 'My Bookings!A1:I1000',
      values: [bookingsHeaders, ...bookingsRows],
    },
  ];

  const updateResponse = await fetch(updateUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption,
      data: valueRanges,
    }),
  });

  if (!updateResponse.ok) {
    const errText = await updateResponse.text();
    throw new Error(`Failed to update sheet values: ${errText}`);
  }

  // Apply visual styling (dark header row, gold text, frozen header)
  try {
    const styleUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
    const sheetId = spreadsheet.sheets[0].properties.sheetId;

    const requests = [
      // Freeze the first row
      {
        updateSheetProperties: {
          properties: {
            sheetId,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
          fields: 'gridProperties.frozenRowCount',
        },
      },
      // Format row 1 headers (Background: Dark #18120d, Text: Gold #D4AF37, Bold, Centered)
      {
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: 9,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: {
                red: 0.09,
                green: 0.07,
                blue: 0.05,
              },
              textFormat: {
                foregroundColor: {
                  red: 0.83,
                  green: 0.69,
                  blue: 0.22,
                },
                bold: true,
                fontSize: 10,
                fontFamily: 'Consolas',
              },
              horizontalAlignment: 'CENTER',
            },
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
        },
      },
      // Auto-fit column sizes
      {
        autoResizeDimensions: {
          dimensions: {
            sheetId,
            dimension: 'COLUMNS',
            startIndex: 0,
            endIndex: 9,
          },
        },
      },
    ];

    await fetch(styleUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });
  } catch (styleErr) {
    console.warn('Could not apply pharaonic styling to user bookings sheet:', styleErr);
  }

  return { id: spreadsheetId, url: spreadsheetUrl };
}
