// ============================================================
// Google Apps Script - CuraGo Payment Handler with Invoice & Test Link
// ============================================================
// Instructions:
// 1. Go to https://script.google.com
// 2. Create a new project or open your existing one
// 3. Add this code AS A SEPARATE SCRIPT FILE (not replacing the existing assessment code)
// 4. Update CONFIG section with your details
// 5. Create a sheet named "CALA Payment Sheet" with these headers:
//    Timestamp | Order ID | Payment ID | Email | Phone | Amount (₹) | City | WhatsApp | Invoice Sent | Test Link Sent
// 6. Deploy → New deployment → Web app → "Who has access" = "Anyone"
// 7. Copy the deployment URL and add it to your Razorpay webhook settings
// 8. In Razorpay Dashboard: Settings → Webhooks → Add webhook URL
// 9. Select event: "payment.captured"
// ============================================================

const CONFIG = {
  // Sheet Configuration
  PAYMENT_SHEET_NAME: 'CALA Payment Sheet',

  // Email Configuration
  EMAIL_SUBJECT: 'Your CuraGo CALA 1.0 Assessment - Invoice & Access Link',
  FROM_NAME: 'CuraGo Team',
  COMPANY_NAME: 'CuraGo',
  COMPANY_WEBSITE: 'https://curago.in',
  SUPPORT_EMAIL: 'curagodoctor@gmail.com',
  WHATSAPP_NUMBER: '+919148615951',

  // Assessment Configuration
  ASSESSMENT_NAME: 'CALA 1.0 - Clinical Anxiety Loop Assessment',
  TEST_UUID: '7f3c9b8e-4a2d-4c6a-9f21-8c7e5b2d1a94',
  BASE_TEST_URL: 'https://curago.in/cala/quiz',

  // Invoice Configuration
  COMPANY_ADDRESS: 'Bangalore, Karnataka, India',
  COMPANY_GST: '', // Add your GST number if applicable

  // Google Drive folder ID for storing invoices (optional)
  // Leave empty to save in root, or paste folder ID here
  DRIVE_FOLDER_ID: '1ztLlzdZgZyJZR1BfICOHBPzbeNRDwTTx',
};

// ============================================================
// WEBHOOK ENDPOINT - Receives Razorpay payment notifications
// ============================================================
function doPost(e) {
  try {
    Logger.log('=== Payment Webhook Received ===');

    // Parse the incoming Razorpay payload
    const data = JSON.parse(e.postData.contents);
    const event = data.event; // e.g., "payment.captured"
    const payment = data.payload.payment.entity;

    Logger.log('Event: ' + event);
    Logger.log('Payment ID: ' + payment.id);

    // Only process captured payments
    if (event !== 'payment.captured') {
      Logger.log('Event ignored: ' + event);
      return ContentService.createTextOutput('Event ignored').setMimeType(ContentService.MimeType.TEXT);
    }

    // Handle the payment
    handlePaymentCapture(payment);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Payment processed successfully'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('ERROR in doPost: ' + error.toString());

    // Log error to sheet for debugging
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const errorSheet = ss.getSheetByName('Error Log') || ss.insertSheet('Error Log');
      errorSheet.appendRow([new Date(), 'Payment Webhook Error', error.toString()]);
    } catch (e) {
      Logger.log('Could not log error to sheet: ' + e.toString());
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================
// HANDLE PAYMENT CAPTURE
// ============================================================
function handlePaymentCapture(payment) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.PAYMENT_SHEET_NAME);

  if (!sheet) {
    throw new Error('Sheet "' + CONFIG.PAYMENT_SHEET_NAME + '" not found. Please create it with proper headers.');
  }

  // Convert paise to rupees
  const amountInRupees = payment.amount / 100;

  // Extract payment details
  const paymentData = {
    timestamp: new Date(),
    orderId: payment.order_id || 'N/A',
    paymentId: payment.id,
    email: payment.email || '',
    contact: payment.contact || '',
    amount: amountInRupees,
    city: (payment.notes && payment.notes.city) ? payment.notes.city : '',
    whatsapp: (payment.notes && payment.notes.whatsapp) ? payment.notes.whatsapp : '',
    method: payment.method || 'unknown',
    status: payment.status
  };

  Logger.log('Payment Data: ' + JSON.stringify(paymentData));

  // Check if payment already exists (prevent duplicates)
  const existingRow = findPaymentRow(sheet, payment.id);
  if (existingRow > 0) {
    Logger.log('Payment already exists at row: ' + existingRow);
    return;
  }

  // Generate invoice PDF
  let invoicePdf = null;
  let testLink = '';

  try {
    invoicePdf = generateInvoicePdf(paymentData);
    testLink = buildTestLink(payment.id);
    Logger.log('Invoice PDF generated, Test Link: ' + testLink);
  } catch (pdfError) {
    Logger.log('PDF Generation Error: ' + pdfError.toString());
  }

  // Send email with invoice and test link
  let emailSent = 'No';
  let linkSent = 'No';

  if (paymentData.email && paymentData.email.trim() !== '') {
    try {
      sendPaymentEmail(paymentData, invoicePdf, testLink);
      emailSent = 'Yes';
      linkSent = 'Yes';
      Logger.log('Email sent successfully to: ' + paymentData.email);
    } catch (emailError) {
      Logger.log('Email Error: ' + emailError.toString());
      emailSent = 'Failed: ' + emailError.toString().substring(0, 50);
    }
  } else {
    Logger.log('No email provided, skipping email send');
    emailSent = 'No Email';
  }

  // Save to Google Sheet
  const rowData = [
    paymentData.timestamp,
    paymentData.orderId,
    paymentData.paymentId,
    paymentData.email,
    paymentData.contact,
    paymentData.amount,
    paymentData.city,
    paymentData.whatsapp,
    emailSent,
    linkSent
  ];

  sheet.appendRow(rowData);
  Logger.log('Payment saved to sheet');
}

// ============================================================
// FIND PAYMENT ROW (Check for duplicates)
// ============================================================
function findPaymentRow(sheet, paymentId) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) { // Start from 1 to skip header
    if (data[i][2] === paymentId) { // Column C = Payment ID
      return i + 1; // Return row number (1-indexed)
    }
  }
  return -1; // Not found
}

// ============================================================
// BUILD TEST LINK
// ============================================================
function buildTestLink(paymentId) {
  return CONFIG.BASE_TEST_URL +
         '?uuid=' + CONFIG.TEST_UUID +
         '&payment_id=' + paymentId;
}

// ============================================================
// GENERATE INVOICE PDF
// ============================================================
function generateInvoicePdf(paymentData) {
  const invoiceNumber = 'INV-' + paymentData.paymentId.toUpperCase();
  const invoiceDate = Utilities.formatDate(paymentData.timestamp, 'Asia/Kolkata', 'dd MMM yyyy');
  const invoiceTime = Utilities.formatDate(paymentData.timestamp, 'Asia/Kolkata', 'hh:mm a');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      background: #096b17;
      color: white;
      padding: 30px;
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0 0 5px 0;
      font-size: 32px;
    }
    .header p {
      margin: 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .invoice-details {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      padding: 20px;
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
    }
    .invoice-details div {
      flex: 1;
    }
    .invoice-details h3 {
      margin: 0 0 10px 0;
      color: #096b17;
      font-size: 16px;
    }
    .invoice-details p {
      margin: 5px 0;
      font-size: 14px;
    }
    .invoice-table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
    }
    .invoice-table th {
      background: #096b17;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: normal;
    }
    .invoice-table td {
      padding: 12px;
      border-bottom: 1px solid #e0e0e0;
    }
    .total-row {
      background: #f8f9fa;
      font-weight: bold;
      font-size: 18px;
    }
    .total-row td {
      padding: 15px 12px;
      border-bottom: none;
    }
    .payment-info {
      background: #f0f7f1;
      padding: 20px;
      margin: 20px 0;
      border: 1px solid #d0e5d3;
    }
    .payment-info h3 {
      margin: 0 0 10px 0;
      color: #096b17;
    }
    .payment-info p {
      margin: 5px 0;
      font-size: 14px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      color: #666;
      font-size: 12px;
    }
    .important-note {
      background: #fff3cd;
      border: 1px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .important-note strong {
      color: #856404;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>INVOICE</h1>
    <p>${CONFIG.COMPANY_NAME}</p>
  </div>

  <div class="invoice-details">
    <div>
      <h3>From:</h3>
      <p><strong>${CONFIG.COMPANY_NAME}</strong></p>
      <p>${CONFIG.COMPANY_ADDRESS}</p>
      ${CONFIG.COMPANY_GST ? '<p>GST: ' + CONFIG.COMPANY_GST + '</p>' : ''}
      <p>Email: ${CONFIG.SUPPORT_EMAIL}</p>
    </div>
    <div>
      <h3>To:</h3>
      <p><strong>${paymentData.email || 'Customer'}</strong></p>
      ${paymentData.contact ? '<p>Phone: ' + paymentData.contact + '</p>' : ''}
      ${paymentData.city ? '<p>City: ' + paymentData.city + '</p>' : ''}
    </div>
    <div>
      <h3>Invoice Details:</h3>
      <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
      <p><strong>Date:</strong> ${invoiceDate}</p>
      <p><strong>Time:</strong> ${invoiceTime}</p>
      <p><strong>Payment ID:</strong> ${paymentData.paymentId}</p>
    </div>
  </div>

  <table class="invoice-table">
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align: center;">Quantity</th>
        <th style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <strong>${CONFIG.ASSESSMENT_NAME}</strong><br>
          <small style="color: #666;">One-time assessment access</small>
        </td>
        <td style="text-align: center;">1</td>
        <td style="text-align: right;">₹${paymentData.amount.toFixed(2)}</td>
      </tr>
      <tr class="total-row">
        <td colspan="2" style="text-align: right;">TOTAL PAID:</td>
        <td style="text-align: right;">₹${paymentData.amount.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <div class="payment-info">
    <h3>Payment Information</h3>
    <p><strong>Payment Method:</strong> ${paymentData.method ? paymentData.method.toUpperCase() : 'Online'}</p>
    <p><strong>Payment Status:</strong> <span style="color: #096b17; font-weight: bold;">SUCCESSFUL</span></p>
    <p><strong>Transaction ID:</strong> ${paymentData.paymentId}</p>
    ${paymentData.orderId !== 'N/A' ? '<p><strong>Order ID:</strong> ' + paymentData.orderId + '</p>' : ''}
  </div>

  <div class="important-note">
    <p><strong>Important:</strong> This invoice confirms your payment for the CALA 1.0 assessment. Your unique test access link has been sent in a separate email. Please check your inbox.</p>
  </div>

  <div class="footer">
    <p><strong>${CONFIG.COMPANY_NAME}</strong></p>
    <p>${CONFIG.COMPANY_WEBSITE} | ${CONFIG.SUPPORT_EMAIL}</p>
    <p>WhatsApp: ${CONFIG.WHATSAPP_NUMBER}</p>
    <p style="margin-top: 10px;">Thank you for choosing CuraGo for your mental wellness journey.</p>
  </div>
</body>
</html>
  `;

  const blob = Utilities.newBlob(html, 'text/html', 'temp.html').getAs('application/pdf');
  blob.setName('CuraGo_Invoice_' + paymentData.paymentId + '.pdf');

  // Optionally save to Google Drive
  if (CONFIG.DRIVE_FOLDER_ID) {
    try {
      const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      Logger.log('Invoice saved to Drive: ' + file.getUrl());
    } catch (driveError) {
      Logger.log('Drive save error: ' + driveError.toString());
    }
  }

  return blob;
}

// ============================================================
// SEND PAYMENT EMAIL WITH INVOICE & TEST LINK
// ============================================================
function sendPaymentEmail(paymentData, invoicePdf, testLink) {
  const plainBody = `
Hi there!

Thank you for your payment of ₹${paymentData.amount} for the CuraGo CALA 1.0 Assessment.

PAYMENT CONFIRMATION:
- Payment ID: ${paymentData.paymentId}
- Amount: ₹${paymentData.amount}
- Status: SUCCESSFUL
- Date: ${Utilities.formatDate(paymentData.timestamp, 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a')}

YOUR TEST ACCESS LINK:
${testLink}

IMPORTANT INSTRUCTIONS:
1. Click the link above to start your assessment
2. You MUST use the following credentials to access the test:
   - Email: ${paymentData.email}
   - Phone: ${paymentData.contact}
3. These details must match EXACTLY with what you entered during payment
4. This link is valid for ONE assessment only
5. Please complete the assessment in one sitting (approx. 10-15 minutes)

Your invoice is attached to this email for your records.

If you have any questions or face any issues accessing the test, please contact us:
- Email: ${CONFIG.SUPPORT_EMAIL}
- WhatsApp: ${CONFIG.WHATSAPP_NUMBER}
- Website: ${CONFIG.COMPANY_WEBSITE}

Best regards,
CuraGo Team
Your Partner in Mental Wellness
  `;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: #096b17; color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; background: #ffffff; }
    .payment-box { background: #f0f7f1; padding: 20px; margin: 20px 0; border-left: 4px solid #096b17; }
    .payment-box h3 { margin: 0 0 10px 0; color: #096b17; }
    .test-link-box { background: #096b17; color: white; padding: 25px; text-align: center; margin: 25px 0; border-radius: 8px; }
    .test-link-box a {
      display: inline-block;
      background: #64CB81;
      color: white;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      font-size: 16px;
      margin-top: 10px;
    }
    .instructions { background: #fff3cd; border: 1px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .instructions h3 { margin: 0 0 15px 0; color: #856404; }
    .instructions ol { margin: 10px 0; padding-left: 20px; }
    .instructions li { margin: 8px 0; }
    .credentials { background: white; padding: 15px; margin: 15px 0; border: 2px dashed #096b17; }
    .credentials p { margin: 5px 0; font-family: monospace; font-size: 14px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; background: #f8f9fa; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Payment Successful!</h1>
      <p>Your CALA 1.0 Assessment is Ready</p>
    </div>

    <div class="content">
      <h2>Hi there! 👋</h2>
      <p>Thank you for your payment. Your CALA 1.0 assessment is now unlocked and ready to begin.</p>

      <div class="payment-box">
        <h3>Payment Confirmation</h3>
        <p><strong>Amount Paid:</strong> ₹${paymentData.amount}</p>
        <p><strong>Payment ID:</strong> ${paymentData.paymentId}</p>
        <p><strong>Status:</strong> <span style="color: #096b17; font-weight: bold;">SUCCESSFUL</span></p>
        <p><strong>Date:</strong> ${Utilities.formatDate(paymentData.timestamp, 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a')}</p>
      </div>

      <div class="test-link-box">
        <h3 style="color: white; margin: 0 0 10px 0;">🎯 Start Your Assessment</h3>
        <p style="margin: 0 0 15px 0; font-size: 14px;">Click the button below to begin your CALA 1.0 assessment</p>
        <a href="${testLink}">START ASSESSMENT NOW</a>
      </div>

      <div class="instructions">
        <h3>⚠️ IMPORTANT: Read Before Starting</h3>
        <ol>
          <li>You MUST use these exact credentials to unlock the test:</li>
        </ol>
        <div class="credentials">
          <p><strong>📧 Email:</strong> ${paymentData.email}</p>
          <p><strong>📱 Phone:</strong> ${paymentData.contact}</p>
        </div>
        <ol start="2">
          <li>These details must match EXACTLY (case-sensitive for email)</li>
          <li>This link allows ONE assessment only - cannot be reused</li>
          <li>Complete the assessment in one sitting (10-15 minutes)</li>
          <li>Your personalized results will be generated instantly</li>
        </ol>
      </div>

      <p><strong>Need Help?</strong></p>
      <p>If you face any issues accessing the test or have questions:</p>
      <ul>
        <li>📧 Email: <a href="mailto:${CONFIG.SUPPORT_EMAIL}">${CONFIG.SUPPORT_EMAIL}</a></li>
        <li>💬 WhatsApp: <a href="https://wa.me/${CONFIG.WHATSAPP_NUMBER.replace(/\+/g, '')}">${CONFIG.WHATSAPP_NUMBER}</a></li>
        <li>🌐 Website: <a href="${CONFIG.COMPANY_WEBSITE}">${CONFIG.COMPANY_WEBSITE}</a></li>
      </ul>

      <p style="margin-top: 30px;"><strong>Your invoice is attached to this email for your records.</strong></p>
    </div>

    <div class="footer">
      <p><strong>CuraGo - Your Partner in Mental Wellness</strong></p>
      <p>${CONFIG.COMPANY_WEBSITE}</p>
      <p style="margin-top: 10px; font-size: 12px;">
        This is an automated email. Please do not reply directly to this message.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const emailOptions = {
    htmlBody: htmlBody,
    name: CONFIG.FROM_NAME
  };

  // Attach invoice PDF if available
  if (invoicePdf) {
    emailOptions.attachments = [invoicePdf];
  }

  GmailApp.sendEmail(
    paymentData.email,
    CONFIG.EMAIL_SUBJECT,
    plainBody,
    emailOptions
  );
}

// ============================================================
// TEST FUNCTION - Manual Testing (Run this from Script Editor)
// ============================================================
function testPaymentEmailFlow() {
  const testPaymentData = {
    timestamp: new Date(),
    orderId: 'order_test123',
    paymentId: 'pay_test456',
    email: 'test@example.com', // Change this to your email for testing
    contact: '+919876543210',
    amount: 299,
    city: 'Bangalore',
    whatsapp: '+919876543210',
    method: 'card',
    status: 'captured'
  };

  const testLink = buildTestLink(testPaymentData.paymentId);
  const invoicePdf = generateInvoicePdf(testPaymentData);

  Logger.log('Test Link: ' + testLink);

  sendPaymentEmail(testPaymentData, invoicePdf, testLink);

  Logger.log('Test email sent successfully!');
}

// ============================================================
// UTILITY: Get doPost URL (Run this to get your webhook URL)
// ============================================================
function getWebhookUrl() {
  const url = ScriptApp.getService().getUrl();
  Logger.log('Your webhook URL: ' + url);
  Logger.log('Add this URL to Razorpay Dashboard → Settings → Webhooks');
  return url;
}
