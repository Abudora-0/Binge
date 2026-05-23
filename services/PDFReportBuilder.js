const PDFDocument = require('pdfkit');

/**
 * Software Class: PDFReportBuilder
 * Builds consistently styled PDF reports for the Binge admin panel.
 * Encapsulates layout constants, page headers, table rendering, and pagination.
 */
class PDFReportBuilder {
    constructor(title, subtitle = '') {
        this.title    = title;
        this.subtitle = subtitle || `Generated on ${new Date().toLocaleDateString()}`;

        // Layout constants
        this.MARGIN      = 40;
        this.ROW_HEIGHT  = 25;
        this.BRAND_COLOR = '#CC0000';
        this.TEXT_DARK   = '#333333';
        this.TEXT_MUTED  = '#888888';

        this.doc = new PDFDocument({ margin: this.MARGIN, size: 'A4' });
        this._y  = this._drawHeader();
    }

    // ── Private helpers ───────────────────────────────────────

    _pageWidth()  { return this.doc.page.width; }
    _pageHeight() { return this.doc.page.height; }

    _drawHeader() {
        const { doc, MARGIN, BRAND_COLOR, TEXT_DARK, TEXT_MUTED } = this;
        doc.fillColor(BRAND_COLOR).fontSize(22).font('Helvetica-Bold').text('Binge', MARGIN, MARGIN);
        doc.fillColor(TEXT_DARK).fontSize(14).font('Helvetica-Bold').text(this.title, MARGIN, 68);
        if (this.subtitle) {
            doc.fillColor(TEXT_MUTED).fontSize(9).font('Helvetica').text(this.subtitle, MARGIN, 86);
        }
        doc.moveTo(MARGIN, 105)
           .lineTo(this._pageWidth() - MARGIN, 105)
           .strokeColor(BRAND_COLOR).lineWidth(1.5).stroke();
        return 120;
    }

    _newPageIfNeeded() {
        if (this._y > this._pageHeight() - 80) {
            this.doc.addPage();
            this._y = 50;
        }
    }

    // ── Public API ────────────────────────────────────────────

    /**
     * Add a summary line above the table (e.g. filter description).
     * @param {string} text
     */
    addSummary(text) {
        this.doc.fillColor(this.TEXT_MUTED).fontSize(9).font('Helvetica').text(text, this.MARGIN, this._y);
        this._y += 16;
        return this;
    }

    /**
     * Draw a data table.
     * @param {string[]} headers  - Column header labels
     * @param {Array[]}  rows     - Array of arrays (one per row, cells as strings)
     */
    drawTable(headers, rows) {
        const { doc, MARGIN, ROW_HEIGHT, BRAND_COLOR, TEXT_DARK } = this;
        const colWidth = (this._pageWidth() - MARGIN * 2) / headers.length;

        // Header row
        doc.fillColor(BRAND_COLOR)
           .rect(MARGIN, this._y, this._pageWidth() - MARGIN * 2, ROW_HEIGHT).fill();
        doc.fillColor('white').fontSize(9).font('Helvetica-Bold');
        headers.forEach((h, i) => {
            doc.text(h, MARGIN + i * colWidth + 5, this._y + 7, { width: colWidth - 10 });
        });
        this._y += ROW_HEIGHT;

        // Data rows
        rows.forEach((row, ri) => {
            this._newPageIfNeeded();
            const fill = ri % 2 === 0 ? '#f9f9f9' : 'white';
            doc.fillColor(fill)
               .rect(MARGIN, this._y, this._pageWidth() - MARGIN * 2, ROW_HEIGHT).fill();
            doc.fillColor(TEXT_DARK).fontSize(8).font('Helvetica');
            row.forEach((cell, i) => {
                doc.text(String(cell ?? '—'), MARGIN + i * colWidth + 5, this._y + 7, { width: colWidth - 10 });
            });
            this._y += ROW_HEIGHT;
        });

        return this;
    }

    /**
     * Add a "No data available" message when the query returned no rows.
     */
    noData() {
        this.doc.fillColor(this.TEXT_MUTED).fontSize(11).font('Helvetica')
            .text('No data available for the selected filters.', this.MARGIN, this._y + 20, { align: 'center' });
        return this;
    }

    /**
     * Pipe the finished PDF to an Express response object.
     * @param {object} res     - Express response
     * @param {string} filename - Suggested download filename (without .pdf)
     */
    send(res, filename) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${filename}.pdf"`);
        this.doc.pipe(res);
        this.doc.end();
    }
}

module.exports = PDFReportBuilder;
