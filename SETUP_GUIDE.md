# Backend Setup Guide: Google Sheets & Apps Script

Follow these steps to set up the backend for your Arwa Group application. This will turn the app from a demo into a fully functional tool powered by your own Google Sheet.

## Step 1: Create Your Google Sheet Database

1.  Create a new Google Sheet in your Google Drive. You can name it **"ArwaApp_Backend"**.
2.  Copy the **Spreadsheet ID** from the URL in your browser's address bar. It's the long string of characters between `/d/` and `/edit`.
    `https://docs.google.com/spreadsheets/d/1OLCDE_fSLvgsuR51YgSIQ0zF16bRfmfi4ouQdJBegjk/edit`
3.  Create the following sheets (tabs) at the bottom. **The names and headers must be an exact match.**

---

*   **Sheet: `Users`**
    *   Headers: `id`, `username`, `role`, `branch`, `name`, `email`
    *   *Action: Add the default user data below to this sheet.*
        ```
        id,username,role,branch,name,email
        1,admin,admin,Riyadh,Admin User,admin@arwa.tech
        2,manager,manager,Riyadh,Sales Manager,manager@arwa.tech
        3,agent,agent,Jeddah,Sales Agent,agent@arwa.tech
        4,accountant,accountant,Riyadh,Finance Accountant,accountant@arwa.tech
        5,hr,hr,Riyadh,HR Specialist,hr@arwa.tech
        ```

*   **Sheet: `Customers`**
    *   Headers: `id`, `name`, `phone`, `email`, `type`, `totalSpend`

*   **Sheet: `Suppliers`**
    *   Headers: `id`, `name`, `type`

*   **Sheet: `Travelers`**
    *   Headers: `id`, `name`, `passportNo`, `nationality`, `customerId`

*   **Sheet: `DSRs`**
    *   Headers: `id`, `date`, `agentUsername`, `agentName`, `customerId`, `travelerId`, `supplierId`, `serviceType`, `pnr`, `ticketNo`, `route`, `sellingFare`, `status`, `baseFare`, `taxes`, `discount`, `netFare`, `commission`, `vatOnCommission`, `paymentMethod`, `airline`, `remarks`

*   **Sheet: `Invoices`**
    *   Headers: `id`, `invoiceNo`, `date`, `customerId`, `dsrId`, `items`, `subtotal`, `vat`, `total`, `status`, `qrCodeTlv`, `firstViewedAt`
    *   *(Note: The 'items' column will store a JSON string of the invoice items array)*

*   **Sheet: `SupplierBills`**
    *   Headers: `id`, `billNo`, `supplierId`, `dsrId`, `date`, `total`, `status`

*   **Sheet: `LeaveRequests`**
    *   Headers: `id`, `employeeId`, `employeeName`, `startDate`, `endDate`, `reason`, `status`

*   **Sheet: `CashHandovers`**
    *   Headers: `id`, `agentId`, `agentName`, `managerId`, `managerName`, `amount`, `dateInitiated`, `dateConfirmed`, `status`

*   **Sheet: `AttendanceLog`**
    *   Headers: `id`, `employeeId`, `employeeName`, `clockInTime`, `clockOutTime`

*   **Sheet: `AuditLog`**
    *   Headers: `id`, `timestamp`, `userId`, `userName`, `action`, `details`, `targetId`

---

## Step 2: Create and Deploy the Google Apps Script

1.  In your Google Sheet, go to `Extensions` > `Apps Script`.
2.  A new script project will open. Delete any existing content in the `Code.gs` file.
3.  Copy the entire content from the `Code.gs` file provided with the app and paste it into the script editor.
4.  **IMPORTANT**: At the top of the script, replace `"YOUR_SPREADSHEET_ID"` with the Spreadsheet ID you copied in Step 1.
5.  Click the floppy disk icon to **Save project**.
6.  Click the blue **Deploy** button > **New deployment**.
7.  Click the gear icon next to "Select type" and choose **Web app**.
8.  Fill in the deployment configuration:
    *   **Description**: `Arwa App API v1`
    *   **Execute as**: `Me`
    *   **Who has access**: `Anyone`
    *   *(Note: Setting access to 'Anyone' is for simplicity. For a production environment with sensitive data, you would implement more robust authentication like Google Sign-In and OAuth.)*
9.  Click **Deploy**.
10. Google will ask you to **Authorize access**. Click the button and sign in with your Google account. You might see a "Google hasn't verified this app" warning. Click **Advanced**, then **Go to [Your Project Name] (unsafe)**. Review the permissions and click **Allow**.
11. After authorizing, a "Deployment successfully updated" dialog will appear. **Copy the Web app URL**. You will need this for the next step.

## Step 3: Connect the Frontend to Your Backend

1.  Open the Arwa Group application in your browser.
2.  Log in as the `admin` user (password: `Airbus@320`).
3.  Navigate to the **Settings** page from the sidebar.
4.  Find the **Backend Configuration** card.
5.  Paste the **Web app URL** you copied from the Apps Script deployment into the input field.
6.  Click **Test Connection**. You should see a "Success! Connection is working." message.
7.  Click **Save Connection**. The URL is now saved, and the app will reload, pulling live data from your Google Sheet.

Your application is now fully connected to your Google Sheets backend! Any changes you make in the app will be reflected in the sheet in real-time.
