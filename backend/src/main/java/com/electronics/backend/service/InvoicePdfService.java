package com.electronics.backend.service;

import com.electronics.backend.model.BillItem;
import com.electronics.backend.model.MonthlyBill;
import com.electronics.backend.repository.MonthlyBillRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;

@Service
public class InvoicePdfService {

    private final MonthlyBillRepository monthlyBillRepository;

    public InvoicePdfService(MonthlyBillRepository monthlyBillRepository) {
        this.monthlyBillRepository = monthlyBillRepository;
    }

    public byte[] generate(Long billId) {
        MonthlyBill bill = monthlyBillRepository.findById(billId)
                .orElseThrow(() -> new IllegalArgumentException("Bill not found: " + billId));

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 40, 40, 40, 40);
        PdfWriter writer = PdfWriter.getInstance(doc, out);

        doc.open();

        // Fonts
        Font h1 = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
        Font h2 = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
        Font normal = FontFactory.getFont(FontFactory.HELVETICA, 10);
        Font bold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
        Font small = FontFactory.getFont(FontFactory.HELVETICA, 9);

        Color violet = new Color(109, 40, 217);
        Color border = new Color(230, 230, 240);
        Color bgSoft = new Color(250, 248, 255);
        Color white = Color.WHITE;

        // ===== Header
        PdfPTable header = new PdfPTable(new float[]{1.2f, 2.8f});
        header.setWidthPercentage(100);

        PdfPCell logoCell = new PdfPCell();
        logoCell.setBorder(Rectangle.NO_BORDER);

        PdfPTable fakeLogo = new PdfPTable(1);
        PdfPCell box = new PdfPCell(new Phrase("EV", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, white)));
        box.setFixedHeight(42);
        box.setHorizontalAlignment(Element.ALIGN_CENTER);
        box.setVerticalAlignment(Element.ALIGN_MIDDLE);
        box.setBackgroundColor(violet);
        box.setBorder(Rectangle.NO_BORDER);
        fakeLogo.addCell(box);
        logoCell.addElement(fakeLogo);

        PdfPCell titleCell = new PdfPCell();
        titleCell.setBorder(Rectangle.NO_BORDER);
        Paragraph title = new Paragraph("FACTURE / INVOICE", h1);
        title.setSpacingAfter(4);
        titleCell.addElement(title);
        titleCell.addElement(new Paragraph("Mario Valencia Electronics", h2));

        header.addCell(logoCell);
        header.addCell(titleCell);
        doc.add(header);

        doc.add(Chunk.NEWLINE);

        // ===== Meta
        PdfPTable meta = new PdfPTable(new float[]{2f, 1.2f});
        meta.setWidthPercentage(100);

        String dateStr = bill.getBillDate() != null
                ? bill.getBillDate().format(DateTimeFormatter.ISO_DATE)
                : "";

        PdfPCell leftMeta = new PdfPCell();
        leftMeta.setBorder(Rectangle.NO_BORDER);
        leftMeta.addElement(new Paragraph("Invoice # : " + bill.getId(), bold));
        leftMeta.addElement(new Paragraph("Date : " + dateStr, normal));
        leftMeta.addElement(new Paragraph("Status : " + (bill.getStatus() != null ? bill.getStatus().name() : ""), normal));

        PdfPCell rightMeta = new PdfPCell();
        rightMeta.setBorder(Rectangle.NO_BORDER);
        rightMeta.setHorizontalAlignment(Element.ALIGN_RIGHT);
        rightMeta.addElement(new Paragraph("Support : support@electroviolet.com", small));
        rightMeta.addElement(new Paragraph("Tel : +33 6 00 00 00 00", small));

        meta.addCell(leftMeta);
        meta.addCell(rightMeta);
        doc.add(meta);

        doc.add(Chunk.NEWLINE);

        // ===== Addresses
        PdfPTable addr = new PdfPTable(new float[]{1f, 1f});
        addr.setWidthPercentage(100);
        addr.addCell(boxCell("Vendeur", "ElectroViolet\n1 Rue Exemple\n75000 Paris\nFrance", bold, normal, violet, bgSoft));
        String buyer = "Client : " + (bill.getCustomer() != null ? bill.getCustomer().getEmail() : "") +
                "\nAdresse : (non stockée)\nVille : (non stockée)\nPays : France";
        addr.addCell(boxCell("Acheteur", buyer, bold, normal, violet, bgSoft));
        doc.add(addr);

        doc.add(Chunk.NEWLINE);

        // ===== Items
        PdfPTable items = new PdfPTable(new float[]{3.2f, 0.9f, 1.2f, 1.3f});
        items.setWidthPercentage(100);

        items.addCell(th("Article", violet));
        items.addCell(th("Qté", violet));
        items.addCell(th("PU", violet));
        items.addCell(th("Total", violet));

        BigDecimal subtotal = BigDecimal.ZERO;

        if (bill.getItems() != null) {
            for (BillItem it : bill.getItems()) {
                String desc = it.getDescription() != null ? it.getDescription() : "Item";
                int q = it.getQuantity() != null ? it.getQuantity() : 1;
                BigDecimal qty = BigDecimal.valueOf(q);
                BigDecimal unit = it.getUnitPrice() != null ? it.getUnitPrice() : BigDecimal.ZERO;
                BigDecimal line = it.getLineTotal() != null ? it.getLineTotal() : unit.multiply(qty);

                subtotal = subtotal.add(line);

                items.addCell(td(desc, border));
                items.addCell(tdCenter(String.valueOf(q), border));
                items.addCell(tdRight(money(unit), border));
                items.addCell(tdRight(money(line), border));
            }
        }

        doc.add(items);
        doc.add(Chunk.NEWLINE);

        // ===== Totals
        BigDecimal vat = subtotal.multiply(new BigDecimal("0.20"));
        BigDecimal shipping = BigDecimal.ZERO;
        BigDecimal total = subtotal.add(vat).add(shipping);

        PdfPTable totals = new PdfPTable(new float[]{2.4f, 1f});
        totals.setWidthPercentage(45);
        totals.setHorizontalAlignment(Element.ALIGN_RIGHT);

        totals.addCell(tl("Sous-total", normal));
        totals.addCell(tr(money(subtotal), normal));

        totals.addCell(tl("Livraison", normal));
        totals.addCell(tr(money(shipping), normal));

        totals.addCell(tl("TVA (20%)", normal));
        totals.addCell(tr(money(vat), normal));

        PdfPCell t1 = new PdfPCell(new Phrase("Total", bold));
        t1.setBorder(Rectangle.TOP);
        t1.setPadding(8);

        PdfPCell t2 = new PdfPCell(new Phrase(money(total), bold));
        t2.setBorder(Rectangle.TOP);
        t2.setPadding(8);
        t2.setHorizontalAlignment(Element.ALIGN_RIGHT);

        totals.addCell(t1);
        totals.addCell(t2);

        doc.add(totals);

        doc.add(Chunk.NEWLINE);

        Paragraph foot = new Paragraph(
                "Merci pour votre commande.\nCette facture est générée automatiquement.",
                small
        );
        foot.setSpacingBefore(10);
        doc.add(foot);

        doc.close();
        writer.close();

        return out.toByteArray();
    }

    private PdfPCell boxCell(String title, String content, Font titleFont, Font contentFont,
                             Color borderColor, Color bgColor) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(10);
        cell.setBorderColor(borderColor);
        cell.setBorderWidth(0.6f);
        cell.setBackgroundColor(bgColor);

        Paragraph t = new Paragraph(title, titleFont);
        t.setSpacingAfter(6);
        cell.addElement(t);
        cell.addElement(new Paragraph(content, contentFont));
        return cell;
    }

    private PdfPCell th(String text, Color bg) {
        PdfPCell c = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE)));
        c.setBackgroundColor(bg);
        c.setBorderColor(bg);
        c.setPadding(8);
        return c;
    }

    private PdfPCell td(String text, Color border) {
        PdfPCell c = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA, 10)));
        c.setPadding(8);
        c.setBorderColor(border);
        return c;
    }

    private PdfPCell tdCenter(String text, Color border) {
        PdfPCell c = td(text, border);
        c.setHorizontalAlignment(Element.ALIGN_CENTER);
        return c;
    }

    private PdfPCell tdRight(String text, Color border) {
        PdfPCell c = td(text, border);
        c.setHorizontalAlignment(Element.ALIGN_RIGHT);
        return c;
    }

    private PdfPCell tl(String label, Font font) {
        PdfPCell c = new PdfPCell(new Phrase(label, font));
        c.setBorder(Rectangle.NO_BORDER);
        c.setPadding(6);
        return c;
    }

    private PdfPCell tr(String value, Font font) {
        PdfPCell c = new PdfPCell(new Phrase(value, font));
        c.setBorder(Rectangle.NO_BORDER);
        c.setHorizontalAlignment(Element.ALIGN_RIGHT);
        c.setPadding(6);
        return c;
    }

    private String money(BigDecimal v) {
        if (v == null) return "0.00 €";
        return v.setScale(2, RoundingMode.HALF_UP).toPlainString() + " €";
    }
}
