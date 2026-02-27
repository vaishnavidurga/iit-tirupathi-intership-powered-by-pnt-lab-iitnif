// Generate a validation PDF report from ML validation results
// jsPDF is imported lazily to avoid bundling it into the main application chunk.
export async function generateValidationPDF(results){
  const [{ jsPDF }] = await Promise.all([
    import('jspdf')
  ])

  const doc = new jsPDF({orientation:'portrait', unit:'pt', format:'a4'})
  const margin = 40
  let y = 40
  doc.setFontSize(18)
  doc.text('SoilSense — ML Validation Report', margin, y)
  y += 28
  doc.setFontSize(11)
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y)
  y += 20

  doc.setFontSize(12)
  doc.text('Overview', margin, y)
  y += 18
  doc.setFontSize(10)
  doc.text('This report contains mock validation metrics for satellite-derived soil moisture estimates compared with ground truth IoT sensors.', margin, y, {maxWidth: 520})
  y += 36

  // Table header
  doc.setFontSize(12)
  doc.text('Model comparison', margin, y)
  y += 12
  doc.setFontSize(10)
  const tableHeaders = ['Satellite', 'R²', 'RMSE', 'MAE', 'Samples', 'Last updated']
  const colX = [margin, margin+120, margin+200, margin+280, margin+360, margin+440]
  tableHeaders.forEach((h,i)=> doc.text(h, colX[i], y))
  y += 12
  doc.setLineWidth(0.5)
  doc.line(margin, y, margin+520, y)
  y += 8

  results.forEach(r=>{
    if(y>740){ doc.addPage(); y=40 }
    doc.text(String(r.satellite), colX[0], y)
    doc.text(String(r.r_squared), colX[1], y)
    doc.text(String(r.rmse), colX[2], y)
    doc.text(String(r.mae), colX[3], y)
    doc.text(String(r.sampleSize), colX[4], y)
    doc.text(String(r.lastUpdated), colX[5], y)
    y += 16
  })

  y += 18
  doc.setFontSize(12)
  doc.text('Notes & Methodology', margin, y)
  y += 14
  doc.setFontSize(10)
  doc.text('Mock validation performed using synthetic satellite metrics and simulated ground truth. Replace with real validation outputs when available.', margin, y, {maxWidth:520})

  doc.save('soilSense-validation-report.pdf')
}
