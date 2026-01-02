import type { APIRoute } from 'astro';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  console.log('🔵 API endpoint /api/submit-story called');
  
  try {
    // Parse the request body
    const body = await request.json();
    const { 
      submitterName, 
      submitterEmail, 
      memberId,
      storyTitle,
      storyType,
      location,
      yearEra,
      storyContent,
      howHeard,
      permissionGranted
    } = body;
    
    console.log('📝 Received story submission:', { 
      submitterName, 
      submitterEmail, 
      memberId,
      storyTitle,
      storyType,
      location,
      yearEra,
      storyContentLength: storyContent?.length,
      howHeard,
      permissionGranted
    });

    // Validate required fields
    if (!submitterName || !submitterEmail || !storyTitle || !storyType || !storyContent || !howHeard) {
      console.error('❌ Missing required fields:', { 
        submitterName: !!submitterName, 
        submitterEmail: !!submitterEmail, 
        storyTitle: !!storyTitle,
        storyType: !!storyType,
        storyContent: !!storyContent,
        howHeard: !!howHeard
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get credentials from environment variables
    const GOOGLE_SERVICE_ACCOUNT_EMAIL = import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const GOOGLE_PRIVATE_KEY = import.meta.env.GOOGLE_PRIVATE_KEY;
    const GOOGLE_SHEET_ID = import.meta.env.GOOGLE_SHEET_ID;

    console.log('🔑 Environment variables check:', {
      hasEmail: !!GOOGLE_SERVICE_ACCOUNT_EMAIL,
      hasKey: !!GOOGLE_PRIVATE_KEY,
      hasSheetId: !!GOOGLE_SHEET_ID,
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      sheetId: GOOGLE_SHEET_ID,
      keyLength: GOOGLE_PRIVATE_KEY?.length
    });

    if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
      console.error('❌ Missing Google credentials in environment variables');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Server configuration error' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Clean the private key by replacing literal \n with actual newlines
    const cleanedPrivateKey = GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
    console.log('🔧 Private key cleaned, starts with:', cleanedPrivateKey.substring(0, 50));

    // Initialize auth with service account
    console.log('🔐 Initializing JWT auth...');
    const serviceAccountAuth = new JWT({
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: cleanedPrivateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Initialize the sheet
    console.log('📊 Connecting to Google Sheet...');
    const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, serviceAccountAuth);
    
    console.log('📖 Loading sheet info...');
    await doc.loadInfo();
    console.log('✅ Sheet loaded:', doc.title);
    console.log('📄 Available sheets:', doc.sheetsByIndex.map(s => ({ title: s.title, sheetId: s.sheetId })));
    
    // Get the "Stories" sheet by title
    const sheet = doc.sheetsByTitle['Stories'];
    
    if (!sheet) {
      console.error('❌ Could not find "Stories" sheet');
      console.error('Available sheets:', Object.keys(doc.sheetsByTitle));
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Stories sheet not found' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('✅ Found "Stories" sheet, ID:', sheet.sheetId);
    
    // Load the header row before accessing headerValues
    await sheet.loadHeaderRow();
    console.log('📋 Sheet headers:', sheet.headerValues);

    // Prepare row data matching the Stories sheet structure
    const submissionDate = new Date().toISOString();
    const rowData = {
      'Submission Date': submissionDate,
      'Title': storyTitle,
      'Status': 'Pending Review',
      'Author': '', // Leave blank, to be assigned later
      'Publish Date': '', // Leave blank
      'URL Slug': '', // Leave blank
      'Tags': '', // Leave blank
      'Submitter Name': submitterName,
      'Submitter Email': submitterEmail,
      'Member ID': memberId || '',
      'Story Type': storyType,
      'Location': location || '',
      'Year/Era': yearEra || '',
      'Story Content': storyContent,
      'How Heard': howHeard,
      'Permission Granted': permissionGranted ? 'Yes' : 'No',
    };
    
    console.log('➕ Adding row to Stories sheet:', {
      ...rowData,
      'Story Content': `${storyContent.substring(0, 100)}... (${storyContent.length} chars)`
    });

    // Add a new row with timestamp
    const addedRow = await sheet.addRow(rowData);
    
    console.log('✅ Row added successfully, row number:', addedRow.rowNumber);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Story submitted successfully' 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error submitting story to Google Sheets:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to submit story'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
