// ============================================================================
//  ARWA GROUP BUSINESS SUITE - GOOGLE APPS SCRIPT BACKEND API
// ============================================================================
//  Instructions:
//  1. Paste this entire script into your Google Apps Script project.
//  2. Replace "YOUR_SPREADSHEET_ID" with the actual ID of your Google Sheet.
//  3. Deploy as a Web App with "Execute as: Me" and "Who has access: Anyone".
// ============================================================================

const SPREADSHEET_ID = "1OLCDE_fSLvgsuR51YgSIQ0zF16bRfmfi4ouQdJBegjk"; // <-- IMPORTANT: PASTE YOUR SPREADSHEET ID HERE

// --- Main Entry Point ---
function doPost(e) {
  try {
    const request = JSON.parse(e.postData.contents);
    const { action, payload } = request;

    switch (action) {
      case 'testConnection':
        return jsonResponse('success', { status: 'success', message: 'Connection successful!' });
      case 'login':
        return jsonResponse('success', login(payload));
      case 'fetchAllData':
        return jsonResponse('success', fetchAllData());
      case 'getAll':
        return jsonResponse('success', getAll(payload.entity));
      case 'add':
        return jsonResponse('success', add(payload.entity, payload.data));
      case 'update':
        return jsonResponse('success', update(payload.entity, payload.id, payload.data));
      case 'bulkDelete':
        return jsonResponse('success', bulkDelete(payload.entity, payload.ids));
      case 'bulkUpdate':
        return jsonResponse('success', bulkUpdate(payload.entity, payload.updates));
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    return jsonResponse('error', null, error.message);
  }
}

// --- API Action Handlers ---

/**
 * Fetches all initial data required by the application on startup.
 */
function fetchAllData() {
  const sheetNames = [
    'Users', 'Customers', 'Suppliers', 'Travelers', 'DSRs',
    'Invoices', 'SupplierBills', 'LeaveRequests', 'CashHandovers',
    'AttendanceLog', 'AuditLog'
  ];
  const data = {};
  sheetNames.forEach(name => {
    // Convert sheet name to camelCase for the JSON key (e.g., SupplierBills -> supplierBills)
    const key = name.charAt(0).toLowerCase() + name.slice(1);
    data[key] = getAll(name);
  });
  return data;
}


/**
 * Retrieves all records from a single specified sheet.
 * @param {string} entityName - The name of the sheet (e.g., 'DSRs').
 */
function getAll(entityName) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(entityName);
  if (!sheet) return [];
  return sheetToJSON(sheet);
}


/**
 * Handles user login by finding a user by their username.
 * @param {object} payload - The request payload containing the username.
 */
function login(payload) {
    const { username } = payload;
    const usersSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Users');
    const users = sheetToJSON(usersSheet);
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (user) {
        return user;
    } else {
        throw new Error('User not found.');
    }
}


/**
 * Adds a new record to the specified sheet.
 * @param {string} entityName - The name of the sheet.
 * @param {object} data - The data object for the new row.
 */
function add(entityName, data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(entityName);
  const headers = getHeaders(sheet);
  const newRow = headers.map(header => data[header] !== undefined ? data[header] : null);
  sheet.appendRow(newRow);
  return data; // Return the object that was added
}


/**
 * Updates an existing record in the specified sheet by its ID.
 * @param {string} entityName - The name of the sheet.
 * @param {string} id - The ID of the record to update.
 * @param {object} data - An object containing the fields to update.
 */
function update(entityName, id, data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(entityName);
  const headers = getHeaders(sheet);
  const rowIndex = findRowIndexById(sheet, id);
  if (rowIndex === -1) throw new Error(`Record with ID ${id} not found in ${entityName}.`);
  
  const range = sheet.getRange(rowIndex + 1, 1, 1, headers.length);
  const values = range.getValues()[0];
  const currentData = headers.reduce((obj, header, index) => ({ ...obj, [header]: values[index] }), {});

  const updatedData = { ...currentData, ...data };

  const newRowValues = headers.map(header => updatedData[header]);
  range.setValues([newRowValues]);
  
  return updatedData;
}


/**
 * Deletes multiple records from a sheet based on a list of IDs.
 * @param {string} entityName - The name of the sheet.
 * @param {string[]} ids - An array of IDs to delete.
 */
function bulkDelete(entityName, ids) {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(entityName);
    const idColumnIndex = getHeaders(sheet).indexOf('id') + 1;
    if (idColumnIndex === 0) throw new Error(`Sheet ${entityName} must have an 'id' column.`);

    const data = sheet.getDataRange().getValues();
    const rowsToDelete = [];
    
    // Iterate backwards to avoid index shifting issues during deletion
    for (let i = data.length - 1; i >= 1; i--) {
        if (ids.includes(String(data[i][idColumnIndex - 1]))) {
            rowsToDelete.push(i + 1);
        }
    }
    
    rowsToDelete.forEach(rowIndex => sheet.deleteRow(rowIndex));

    return { status: 'success', deletedCount: rowsToDelete.length };
}


/**
 * Updates multiple records in a sheet in a single operation.
 * @param {string} entityName - The name of the sheet.
 * @param {object[]} updates - An array of update objects, each with an `id` and `data`.
 */
function bulkUpdate(entityName, updates) {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(entityName);
    const headers = getHeaders(sheet);
    const idColumnIndex = headers.indexOf('id');
    const data = sheet.getDataRange().getValues();
    
    const dataMap = data.slice(1).map((row, index) => ({
        rowIndex: index + 2, // 1-based index
        id: row[idColumnIndex]
    }));

    updates.forEach(updateItem => {
        const target = dataMap.find(item => item.id === updateItem.id);
        if (target) {
            const range = sheet.getRange(target.rowIndex, 1, 1, headers.length);
            const currentValues = range.getValues()[0];
            const updatedValues = headers.map((header, index) => {
                return updateItem.data.hasOwnProperty(header) ? updateItem.data[header] : currentValues[index];
            });
            range.setValues([updatedValues]);
        }
    });

    return { status: 'success', updatedCount: updates.length };
}


// --- Helper Functions ---

/**
 * Converts sheet data into an array of JSON objects.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to process.
 */
function sheetToJSON(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return []; // No data rows
  const headers = data[0].map(h => String(h).trim());
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      // Handle JSON strings in cells (like 'items' in Invoices)
      if (header === 'items' && typeof row[index] === 'string') {
        try {
          obj[header] = JSON.parse(row[index]);
        } catch (e) {
          obj[header] = row[index]; // Fallback to string if parse fails
        }
      } else {
        obj[header] = row[index];
      }
    });
    return obj;
  });
}

/**
 * Gets the header row of a sheet.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to process.
 */
function getHeaders(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}


/**
 * Finds the row index (1-based) of a record by its ID.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to search in.
 * @param {string} id - The ID to find.
 */
function findRowIndexById(sheet, id) {
    const idColumnIndex = getHeaders(sheet).indexOf('id') + 1;
    if (idColumnIndex === 0) return -1; // No 'id' column
    const ids = sheet.getRange(2, idColumnIndex, sheet.getLastRow() - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
        if (String(ids[i][0]) === String(id)) {
            return i + 2; // +2 because it's 1-based and we skipped the header
        }
    }
    return -1;
}

/**
 * Formats the API response into a standard JSON structure.
 * @param {string} status - 'success' or 'error'.
 * @param {*} data - The data payload.
 * @param {string} [message] - An optional error message.
 */
function jsonResponse(status, data, message = '') {
  return ContentService.createTextOutput(JSON.stringify({ status, data, message }))
    .setMimeType(ContentService.MimeType.JSON);
}