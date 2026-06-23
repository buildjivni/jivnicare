/* eslint-disable jsx-a11y/alt-text */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { Document, Page, Text, View, StyleSheet, Image, pdf } from "@react-pdf/renderer";

// Styles for the PDF layout (brand navy #1B3F6B, white text, premium typography)
const styles = StyleSheet.create({
  // A4 Page Layout
  a4Page: {
    backgroundColor: "#1B3F6B",
    color: "#FFFFFF",
    padding: 40,
    fontFamily: "Helvetica",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    height: "100%",
  },
  // 10x10cm Sticker Page Layout
  stickerPage: {
    backgroundColor: "#1B3F6B",
    color: "#FFFFFF",
    padding: 20,
    fontFamily: "Helvetica",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    height: "100%",
  },
  // Logo header
  logoContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  logoTextPrimary: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4A90D9", // Sky blue for Jivni
  },
  logoTextSecondary: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#489C66", // Emerald green for Care
  },
  logoSubtitle: {
    fontSize: 10,
    color: "#A0B2C6",
    letterSpacing: 2,
    marginTop: 4,
    textTransform: "uppercase",
  },
  stickerLogoContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  stickerLogoTextPrimary: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A90D9",
  },
  stickerLogoTextSecondary: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#489C66",
  },
  // Doctor details
  headerSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  drName: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
  },
  drSpecialty: {
    fontSize: 18,
    color: "#A0B2C6",
    textAlign: "center",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  drQualifications: {
    fontSize: 14,
    color: "#E2E8F0",
    textAlign: "center",
  },
  // Sticker details (smaller text size)
  stickerHeaderSection: {
    alignItems: "center",
    marginVertical: 5,
  },
  stickerDrName: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 3,
  },
  stickerDrSpecialty: {
    fontSize: 12,
    color: "#A0B2C6",
    textAlign: "center",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  stickerDrQualifications: {
    fontSize: 10,
    color: "#E2E8F0",
    textAlign: "center",
  },
  // QR container
  qrSection: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1B3F6B",
    padding: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#2E5B94",
    marginVertical: 20,
  },
  stickerQrSection: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1B3F6B",
    padding: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#2E5B94",
    marginVertical: 10,
  },
  qrImage: {
    width: 220,
    height: 220,
  },
  stickerQrImage: {
    width: 140,
    height: 140,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
    color: "#FFFFFF",
    marginTop: 10,
    textTransform: "uppercase",
  },
  stickerCtaText: {
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 0.5,
    color: "#FFFFFF",
    marginTop: 5,
    textTransform: "uppercase",
  },
  // Clinic & Location Footer
  footerSection: {
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
  },
  clinicName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 4,
  },
  clinicLocation: {
    fontSize: 12,
    color: "#A0B2C6",
    textAlign: "center",
    marginBottom: 15,
  },
  jvcIdText: {
    fontSize: 11,
    color: "#7E94B0",
    letterSpacing: 1,
    marginBottom: 10,
  },
  platformText: {
    fontSize: 10,
    color: "#5C7596",
    borderTopWidth: 1,
    borderTopColor: "#2E5B94",
    paddingTop: 10,
    width: "80%",
    textAlign: "center",
  },
  // Sticker Footer
  stickerFooterSection: {
    alignItems: "center",
    marginBottom: 5,
    width: "100%",
  },
  stickerClinicName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 2,
  },
  stickerClinicLocation: {
    fontSize: 9,
    color: "#A0B2C6",
    textAlign: "center",
    marginBottom: 5,
  },
  stickerJvcIdText: {
    fontSize: 8,
    color: "#7E94B0",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  stickerPlatformText: {
    fontSize: 7,
    color: "#5C7596",
    borderTopWidth: 0.5,
    borderTopColor: "#2E5B94",
    paddingTop: 4,
    width: "90%",
    textAlign: "center",
  },
});

// PDF Document Component containing A4 (Page 1) and 10x10cm (Page 2) layouts
interface PDFProps {
  doctor: {
    name: string;
    speciality: string;
    qualifications?: string;
    clinicName?: string;
    hospitalName?: string;
    city?: string;
    district?: string;
    slug: string;
    jivnicareId?: string;
  };
  qrBase64: string;
}

const QRStickerDocument = ({ doctor, qrBase64 }: PDFProps) => {
  const drTitle = doctor.name.toLowerCase().startsWith("dr") ? "" : "Dr. ";
  const displayQualifications = doctor.qualifications || "Medical Practitioner";
  const displayClinic = doctor.clinicName || doctor.hospitalName || "JivniCare Partner Clinic";
  const displayLocation = [doctor.city, doctor.district].filter(Boolean).join(", ");
  const jvcId = doctor.jivnicareId || `JC-DR-${doctor.slug.slice(-6).toUpperCase()}`;

  return (
    <Document title={`${doctor.name} - Clinic QR Code Sticker`}>
      {/* PAGE 1: Standard A4 Layout */}
      <Page size="A4" style={styles.a4Page}>
        {/* Logo Section */}
        <View style={{ alignItems: "center" }}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoTextPrimary}>Jivni</Text>
            <Text style={styles.logoTextSecondary}>Care</Text>
          </View>
          <Text style={styles.logoSubtitle}>Digital Clinic Queue</Text>
        </View>

        {/* Doctor Details */}
        <View style={styles.headerSection}>
          <Text style={styles.drName}>{drTitle}{doctor.name}</Text>
          <Text style={styles.drSpecialty}>{doctor.speciality}</Text>
          <Text style={styles.drQualifications}>{displayQualifications}</Text>
        </View>

        {/* QR Code Graphic Area */}
        <View style={styles.qrSection}>
          <Image style={styles.qrImage} src={qrBase64} />
          <Text style={styles.ctaText}>Scan to Book Appointment</Text>
        </View>

        {/* Footer Info */}
        <View style={styles.footerSection}>
          <Text style={styles.clinicName}>{displayClinic}</Text>
          <Text style={styles.clinicLocation}>{displayLocation}</Text>
          <Text style={styles.jvcIdText}>ID: {jvcId}</Text>
          <Text style={styles.platformText}>Powered by JivniCare Queue System • www.jivnicare.com</Text>
        </View>
      </Page>

      {/* PAGE 2: 10x10cm Sticker Layout (283.46 x 283.46 points) */}
      <Page size={[283.46, 283.46]} style={styles.stickerPage}>
        {/* Small Logo */}
        <View style={styles.stickerLogoContainer}>
          <Text style={styles.stickerLogoTextPrimary}>Jivni</Text>
          <Text style={styles.stickerLogoTextSecondary}>Care</Text>
        </View>

        {/* Doctor Info */}
        <View style={styles.stickerHeaderSection}>
          <Text style={styles.stickerDrName}>{drTitle}{doctor.name}</Text>
          <Text style={styles.stickerDrSpecialty}>{doctor.speciality}</Text>
        </View>

        {/* QR Section */}
        <View style={styles.stickerQrSection}>
          <Image style={styles.stickerQrImage} src={qrBase64} />
          <Text style={styles.stickerCtaText}>Scan to Book Appointment</Text>
        </View>

        {/* Footer */}
        <View style={styles.stickerFooterSection}>
          <Text style={styles.stickerClinicName}>{displayClinic}</Text>
          <Text style={styles.stickerJvcIdText}>ID: {jvcId}</Text>
          <Text style={styles.stickerPlatformText}>www.jivnicare.com</Text>
        </View>
      </Page>
    </Document>
  );
};

export async function GET(request: NextRequest) {
  let doctorData: any = null;
  let qrBase64Url: string = "";

  try {
    // 1. Verify doctor session
    const auth = await requireSession(["DOCTOR"]);
    if (auth.response) return auth.response;
    const payload = auth.session!;

    // 2. Fetch doctor data
    const doctor = await prisma.doctor.findUnique({
      where: { userId: payload.id },
      include: { platformPricing: true }
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    doctorData = doctor;

    // 3. Generate QR Code image as base64 (White on Navy)
    const bookingUrl = `https://jivnicare.com/doctors/${doctor.slug}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(bookingUrl)}&color=ffffff&bgcolor=1b3f6b`;
    
    try {
      const qrResponse = await fetch(qrUrl);
      if (!qrResponse.ok) throw new Error("QR API failed");
      const qrBuffer = await qrResponse.arrayBuffer();
      qrBase64Url = `data:image/png;base64,${Buffer.from(qrBuffer).toString("base64")}`;
    } catch (e) {
      console.error("[QR_GENERATION_FAILED], falling back to inline placeholder", e);
      qrBase64Url = qrUrl; 
    }
  } catch (error) {
    console.error("[QR_STICKER_API_ERROR]", error);
    return NextResponse.json({ error: "Failed to generate QR sticker PDF" }, { status: 500 });
  }

  if (!doctorData) {
    return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
  }

  // 4. Generate PDF stream using @react-pdf/renderer
  // Constructed outside try/catch to satisfy "Avoid constructing JSX within try/catch" lint rules
  const docInstance = (
    <QRStickerDocument 
      doctor={{
        name: doctorData.name,
        speciality: doctorData.speciality,
        qualifications: doctorData.qualifications || undefined,
        clinicName: doctorData.clinicName || undefined,
        hospitalName: doctorData.hospitalName || undefined,
        city: doctorData.city || undefined,
        district: doctorData.district || undefined,
        slug: doctorData.slug,
        jivnicareId: doctorData.jivnicareId || undefined,
      }} 
      qrBase64={qrBase64Url} 
    />
  );

  try {
    const pdfStream = await pdf(docInstance).toBuffer();

    // 5. Return PDF Response
    return new NextResponse(pdfStream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="jivnicare-sticker-${doctorData.slug}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[QR_STICKER_RENDER_ERROR]", error);
    return NextResponse.json({ error: "Failed to render QR sticker PDF" }, { status: 500 });
  }
}
