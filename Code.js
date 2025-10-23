// ============================================================================
//  ARWA GROUP BUSINESS SUITE - GOOGLE APPS SCRIPT BACKEND API
// ============================================================================
//  Instructions:
//  1. Paste this entire script into your Google Apps Script project.
//  2. Replace "YOUR_SPREADSHEET_ID" with the actual ID of your Google Sheet.
//  3. Deploy as a Web App with "Execute as: Me" and "Who has access: Anyone".
// ============================================================================

const SPREADSHEET_ID = "1OLCDE_fSLvgsuR51YgSIQ0zF16bRfmfi4ouQdJBegjk"; // <-- IMPORTANT: PASTE YOUR SPREADSHEET ID HERE

// --- CORS Preflight Handler ---
// This function handles the browser's preflight OPTIONS request.
function doOptions(e) {
  return ContentService.createTextOutput()
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// --- Main Entry Point ---
function doPost(e) {
  try {
    // Add CORS header to all POST responses
    const responseHeaders = {
      'Access-Control-Allow-Origin': '*'
    };

    const request = JSON.parse(e.postData.contents);
    const { action, payload } = request;

    let responseData;
    switch (action) {
      case 'testConnection':
        responseData = { status: 'success', message: 'Connection successful!' };
        break;
      case 'login':
        responseData = login(payload);
        break;
      case 'fetchAllData':
        responseData = fetchAllData();
        break;
      case 'getAll':
        responseData = getAll(payload.entity);
        break;
      case 'add':
        responseData = add(payload.entity, payload.data);
        break;
      case 'update':
        responseData = update(payload.entity, payload.id, payload.data);
        break;
      case 'bulkDelete':
        responseData = bulkDelete(payload.entity, payload.ids);
        break;
      case 'bulkUpdate':
        responseData = bulkUpdate(payload.entity, payload.updates);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
     return jsonResponse('success', responseData, '', responseHeaders);
  } catch (error) {
    return jsonResponse('error', null, error.message, {'Access-Control-Allow-Origin': '*'});
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
  const newRow = headers.map(header => data[header] !== undefined ? JSON.stringify(data[header]) : null);
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
  const range = sheet.getDataRange();
  const values = range.getValues();
  const idColumnIndex = headers.indexOf('id');
  
  const rowIndex = values.findIndex(row => row[idColumnIndex] == id);
  if (rowIndex === -1) throw new Error(`Record with ID ${id} not found in ${entityName}.`);
  
  const currentData = headers.reduce((obj, header, index) => ({ ...obj, [header]: values[rowIndex][index] }), {});
  const updatedData = { ...currentData, ...data };

  const newRowValues = headers.map(header => updatedData.hasOwnProperty(header) ? JSON.stringify(updatedData[header]) : currentData[header]);
  sheet.getRange(rowIndex + 1, 1, 1, headers.length).setValues([newRowValues]);
  
  return sheetToJSONRow(updatedData, headers);
}


/**
 * Deletes multiple records from a sheet based on a list of IDs.
 * @param {string} entityName - The name of the sheet.
 * @param {string[]} ids - An array of IDs to delete.
 */
function bulkDelete(entityName, ids) {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(entityName);
    const idColumnIndex = getHeaders(sheet).indexOf('id');
    if (idColumnIndex === -1) throw new Error(`Sheet ${entityName} must have an 'id' column.`);

    const data = sheet.getDataRange().getValues();
    const rowsToDelete = [];
    
    for (let i = 1; i < data.length; i++) { // Start from 1 to skip header
        if (ids.includes(String(data[i][idColumnIndex]))) {
            rowsToDelete.push(i + 1);
        }
    }
    
    // Iterate backwards to avoid index shifting issues during deletion
    rowsToDelete.reverse().forEach(rowIndex => sheet.deleteRow(rowIndex));

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
    const dataRange = sheet.getDataRange();
    const allValues = dataRange.getValues();
    
    const updateMap = new Map(updates.map(u => [u.id, u.data]));

    const newValues = allValues.map((row, index) => {
      if (index === 0) return row; // Keep header
      const rowId = row[idColumnIndex];
      if (updateMap.has(rowId)) {
        const updateData = updateMap.get(rowId);
        return headers.map(header => updateData.hasOwnProperty(header) ? JSON.stringify(updateData[header]) : row[headers.indexOf(header)]);
      }
      return row;
    });

    dataRange.setValues(newValues);

    return { status: 'success', updatedCount: updates.length };
}


// --- Helper Functions ---

/**
 * Converts a row object back into a type-consistent object after being read from the sheet.
 */
function sheetToJSONRow(rowObject, headers) {
    const obj = {};
    headers.forEach(header => {
        const value = rowObject[header];
        // Attempt to parse any string that looks like JSON, but fall back to the original string.
        if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
            try {
                obj[header] = JSON.parse(value);
            } catch (e) {
                obj[header] = value;
            }
        } else {
            obj[header] = value;
        }
    });
    return obj;
}


/**
 * Converts sheet data into an array of JSON objects.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to process.
 */
function sheetToJSON(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return []; // No data rows
  const headers = data[0].map(h => String(h).trim());
  return data.slice(1).map(row => {
    return sheetToJSONRow(
      row.reduce((obj, cell, index) => ({ ...obj, [headers[index]]: cell }), {}),
      headers
    );
  });
}

/**
 * Gets the header row of a sheet.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to process.
 */
function getHeaders(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h).trim());
}

/**
 * Formats the API response into a standard JSON structure.
 * @param {string} status - 'success' or 'error'.
 * @param {*} data - The data payload.
 * @param {string} [message] - An optional error message.
 * @param {object} [headers] - Optional headers to add to the response.
 */
function jsonResponse(status, data, message = '', headers = {}) {
  const output = ContentService.createTextOutput(JSON.stringify({ status, data, message }))
    .setMimeType(ContentService.MimeType.JSON);
  
  for (const header in headers) {
    output.setHeader(header, headers[header]);
  }
  
  return output;
}
