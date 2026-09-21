export const exportToCSV = (data, filename) => {
  if (!data || !data.length) {
    alert("No data to export");
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Convert objects to CSV string
  const csvContent = [
    headers.join(","), // Header row
    ...data.map(row => 
      headers.map(header => {
        let cell = row[header] ?? "";
        // Escape quotes and wrap in quotes if contains comma or newline
        cell = String(cell).replace(/"/g, '""');
        if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
          cell = `"${cell}"`;
        }
        return cell;
      }).join(",")
    )
  ].join("\n");

  // Create Blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
