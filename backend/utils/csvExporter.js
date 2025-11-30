/**
 * Export complaints data to CSV format
 */
exports.exportToCSV = (complaints) => {
  // CSV Header
  const headers = ['Complaint ID', 'Category', 'Description', 'Priority', 'Status', 'Date', 'User Name', 'User Email'];
  
  // Create CSV rows
  const rows = complaints.map(complaint => {
    const id = `#${String(complaint._id.toString().slice(-3)).padStart(3, '0')}`;
    const category = complaint.category || '';
    const description = (complaint.description || '').replace(/,/g, ';').replace(/\n/g, ' ');
    const priority = complaint.priority || '';
    const status = complaint.status || '';
    const date = complaint.date ? new Date(complaint.date).toISOString().split('T')[0] : '';
    const userName = complaint.userId?.name || 'N/A';
    const userEmail = complaint.userId?.email || 'N/A';
    
    return [id, category, description, priority, status, date, userName, userEmail].join(',');
  });
  
  // Combine header and rows
  const csv = [headers.join(','), ...rows].join('\n');
  
  return csv;
};

