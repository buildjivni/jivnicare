import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";

// Styles for the PDF layout (clean medical report style)
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#F8FAFC",
    color: "#1E293B",
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#1B3F6B",
    paddingBottom: 15,
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1B3F6B",
  },
  reportTitle: {
    fontSize: 14,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  metaSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  drInfo: {
    flexDirection: "column",
  },
  drName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 4,
  },
  drSub: {
    fontSize: 11,
    color: "#64748B",
  },
  clinicInfo: {
    alignItems: "flex-end",
  },
  clinicName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0F172A",
  },
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: "#1B3F6B",
    color: "#FFFFFF",
  },
  tableColHeader: {
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderBottomColor: "#CBD5E1",
    borderRightWidth: 1,
    borderRightColor: "#CBD5E1",
    padding: 6,
    fontSize: 10,
    fontWeight: "bold",
  },
  tableCol: {
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    borderRightWidth: 1,
    borderRightColor: "#E2E8F0",
    padding: 6,
    fontSize: 9,
  },
  colToken: { width: "12%" },
  colName: { width: "30%" },
  colPhone: { width: "23%" },
  colDate: { width: "20%" },
  colStatus: { width: "15%" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#94A3B8",
  },
});

interface PDFProps {
  doctor: {
    name: string;
    speciality: string;
    clinicName?: string;
    hospitalName?: string;
  };
  patients: {
    tokenNumber: number;
    patientName: string;
    patientPhone: string;
    date: string;
    status: string;
  }[];
}

const ConsultationHistoryDocument = ({ doctor, patients }: PDFProps) => {
  const drTitle = doctor.name.toLowerCase().startsWith("dr") ? "" : "Dr. ";
  const clinic = doctor.clinicName || doctor.hospitalName || "JivniCare Clinic";

  return (
    <Document title={`Consultation Report - ${doctor.name}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>JivniCare</Text>
            <Text style={styles.reportTitle}>Consultation Report</Text>
          </View>
        </View>

        {/* Doctor and Clinic Metadata */}
        <View style={styles.metaSection}>
          <View style={styles.drInfo}>
            <Text style={styles.drName}>{drTitle}{doctor.name}</Text>
            <Text style={styles.drSub}>{doctor.speciality}</Text>
          </View>
          <View style={styles.clinicInfo}>
            <Text style={styles.clinicName}>{clinic}</Text>
            <Text style={styles.drSub}>Date Generated: {new Date().toLocaleDateString("en-IN")}</Text>
            <Text style={styles.drSub}>Total Consultations: {patients.length}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Header Row */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableColHeader, styles.colToken]}>Token</Text>
            <Text style={[styles.tableColHeader, styles.colName]}>Patient Name</Text>
            <Text style={[styles.tableColHeader, styles.colPhone]}>Phone Number</Text>
            <Text style={[styles.tableColHeader, styles.colDate]}>Date</Text>
            <Text style={[styles.tableColHeader, styles.colStatus]}>Status</Text>
          </View>

          {/* Data Rows */}
          {patients.map((p, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.tableCol, styles.colToken]}>#{p.tokenNumber}</Text>
              <Text style={[styles.tableCol, styles.colName]}>{p.patientName}</Text>
              <Text style={[styles.tableCol, styles.colPhone]}>{p.patientPhone}</Text>
              <Text style={[styles.tableCol, styles.colDate]}>{p.date}</Text>
              <Text style={[styles.tableCol, styles.colStatus]}>{p.status}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by JivniCare Queue System</Text>
          <Text style={styles.footerText}>Confidential Medical Record Summary</Text>
        </View>
      </Page>
    </Document>
  );
};

export async function GET(request: NextRequest) {
  let doctorData: any = null;
  let patientsData: any[] = [];

  try {
    // 1. Verify doctor session
    const auth = await requireSession(["DOCTOR"]);
    if (auth.response) return auth.response;
    const payload = auth.session!;

    // 2. Fetch doctor data
    const doctor = await prisma.doctor.findUnique({
      where: { userId: payload.id }
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    doctorData = doctor;

    // 3. Fetch past consultations
    const tokens = await prisma.queueToken.findMany({
      where: {
        queue: { doctorId: doctor.id }
      },
      include: {
        queue: { select: { logicalDate: true } }
      },
      orderBy: {
        bookedAt: "desc"
      },
      take: 50 // Limit to last 50 for page size comfort on A4
    });

    patientsData = tokens.map(t => ({
      tokenNumber: t.tokenNumber,
      patientName: t.patientName || "Walk-in Patient",
      patientPhone: t.patientPhone,
      date: t.queue.logicalDate,
      status: t.status,
    }));
  } catch (error) {
    console.error("[EXPORT_PDF_API_ERROR]", error);
    return NextResponse.json({ error: "Failed to generate report PDF" }, { status: 500 });
  }

  if (!doctorData) {
    return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
  }

  // 4. Generate PDF stream
  const docInstance = (
    <ConsultationHistoryDocument 
      doctor={{
        name: doctorData.name,
        speciality: doctorData.speciality,
        clinicName: doctorData.clinicName || undefined,
        hospitalName: doctorData.hospitalName || undefined,
      }} 
      patients={patientsData} 
    />
  );

  try {
    const pdfStream = await pdf(docInstance).toBuffer();

    // 5. Return PDF Response
    return new NextResponse(pdfStream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="jivnicare-report-${doctorData.slug}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[EXPORT_PDF_RENDER_ERROR]", error);
    return NextResponse.json({ error: "Failed to render report PDF" }, { status: 500 });
  }
}
