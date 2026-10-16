import path from "node:path";
import {
  Document,
  Page,
  View,
  Text,
  Svg,
  Path,
  Font,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

/** SVG path for a diamond (rotated square) centered at (cx, cy) with the
 * given half-diagonal radius — the khatam-lattice brand mark, drawn
 * directly as a path since react-pdf's Rect has no rotation prop. */
function diamondPath(cx: number, cy: number, r: number) {
  return `M${cx},${cy - r} L${cx + r},${cy} L${cx},${cy + r} L${cx - r},${cy} Z`;
}

const FONT_DIR = path.join(process.cwd(), "public", "fonts");

// Amiri is deliberately not embedded here: @react-pdf/renderer's text
// engine doesn't perform Arabic contextual shaping (joining forms,
// ligatures), so Arabic text renders as garbled glyphs rather than
// correct script — confirmed by rendering a real certificate. The brand's
// Arabic-forward identity is carried instead through El Messiri (which
// has calligraphic DNA) and the geometric khatam accents, matching the
// same call made for the auto-generated OG image.
let fontsRegistered = false;
function registerFonts() {
  if (fontsRegistered) return;
  Font.register({
    family: "El Messiri",
    fonts: [
      { src: path.join(FONT_DIR, "ElMessiri-SemiBold.ttf"), fontWeight: 600 },
      { src: path.join(FONT_DIR, "ElMessiri-Bold.ttf"), fontWeight: "bold" },
    ],
  });
  fontsRegistered = true;
}

/* Qandeel light palette — a certificate is read on paper (real or PDF),
   so it uses the ivory/brass/Layl-ink variant, not the night theme. */
const COLORS = {
  paper: "#F4EFE2",
  paperInner: "#FAF7EE",
  brass: "#8A6A34",
  brassLight: "#C6A15B",
  ink: "#0B151B",
  sage: "#4B5A5D",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.paper,
    padding: 28,
    fontFamily: "Helvetica",
  },
  frame: {
    flex: 1,
    borderWidth: 2,
    borderColor: COLORS.brass,
    padding: 3,
  },
  innerFrame: {
    flex: 1,
    borderWidth: 0.75,
    borderColor: COLORS.brassLight,
    backgroundColor: COLORS.paperInner,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 56,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 3,
    color: COLORS.brass,
    marginBottom: 10,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  brandWord: {
    fontFamily: "El Messiri",
    fontWeight: 600,
    fontSize: 20,
    color: COLORS.ink,
    letterSpacing: 1,
  },
  title: {
    fontFamily: "El Messiri",
    fontWeight: "bold",
    fontSize: 32,
    color: COLORS.ink,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 11,
    letterSpacing: 2,
    color: COLORS.sage,
    marginBottom: 16,
    textAlign: "center",
  },
  presentedTo: {
    fontSize: 11,
    color: COLORS.sage,
    marginBottom: 8,
  },
  studentName: {
    fontFamily: "El Messiri",
    fontWeight: "bold",
    fontSize: 28,
    color: COLORS.brass,
    marginBottom: 8,
    textAlign: "center",
  },
  rule: {
    width: 220,
    height: 1,
    backgroundColor: COLORS.brassLight,
    marginBottom: 14,
  },
  body: {
    fontSize: 12.5,
    color: COLORS.ink,
    textAlign: "center",
    lineHeight: 1.4,
    marginBottom: 4,
  },
  courseName: {
    fontFamily: "El Messiri",
    fontWeight: 600,
    fontSize: 16,
    color: COLORS.ink,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 4,
  },
  teacherLine: {
    fontSize: 11,
    color: COLORS.sage,
    textAlign: "center",
    marginBottom: 14,
  },
  teacherName: {
    fontFamily: "El Messiri",
    fontWeight: 600,
    fontSize: 11,
    color: COLORS.brass,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 16,
  },
  footerBlock: {
    alignItems: "center",
    width: 180,
  },
  footerLine: {
    width: 150,
    height: 0.75,
    backgroundColor: COLORS.sage,
    marginBottom: 6,
  },
  footerLabel: {
    fontSize: 8.5,
    letterSpacing: 1.5,
    color: COLORS.sage,
  },
  footerValue: {
    fontSize: 10,
    color: COLORS.ink,
    marginBottom: 6,
    fontWeight: "bold",
  },
  seal: {
    alignItems: "center",
    justifyContent: "center",
  },
});

/* Small rotated-square marks tracing the corners — the same brand motif
   used in the favicon and OG image (a single unit of the khatam lattice). */
function CornerMark({
  position,
}: {
  position: { top?: number; bottom?: number; left?: number; right?: number };
}) {
  const size = 16;
  return (
    <Svg
      width={size}
      height={size}
      style={{ position: "absolute", ...position }}
    >
      <Path
        d={diamondPath(size / 2, size / 2, 7)}
        stroke={COLORS.brass}
        strokeWidth={1}
        fill="none"
      />
    </Svg>
  );
}

export type CertificateData = {
  studentName: string;
  courseTitle: string;
  issuedAt: Date;
  certificateId: string;
  teacherName?: string;
};

function CertificateDocument({ studentName, courseTitle, issuedAt, certificateId, teacherName }: CertificateData) {
  const dateLabel = issuedAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const shortId = certificateId.slice(-10).toUpperCase();

  return (
    <Document
      title={`Certificate of Completion — ${studentName}`}
      author="Maymanah"
      subject={courseTitle}
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.frame}>
          <View style={styles.innerFrame}>
            <CornerMark position={{ top: 14, left: 14 }} />
            <CornerMark position={{ top: 14, right: 14 }} />
            <CornerMark position={{ bottom: 14, left: 14 }} />
            <CornerMark position={{ bottom: 14, right: 14 }} />

            <Text style={styles.eyebrow}>A GLOBAL QURANIC SANCTUARY</Text>
            <View style={styles.brandRow}>
              <Svg width={16} height={16}>
                <Path
                  d={diamondPath(8, 8, 7.5)}
                  stroke={COLORS.brass}
                  strokeWidth={1.5}
                  fill="none"
                />
              </Svg>
              <Text style={styles.brandWord}>MAYMANAH</Text>
            </View>

            <Text style={styles.title}>Certificate of Completion</Text>
            <Text style={styles.subtitle}>ISSUED IN RECOGNITION OF DEDICATED STUDY</Text>

            <Text style={styles.presentedTo}>This certifies that</Text>
            <Text style={styles.studentName}>{studentName}</Text>
            <View style={styles.rule} />

            <Text style={styles.body}>
              has successfully completed the course
            </Text>
            <Text style={styles.courseName}>{courseTitle}</Text>

            {teacherName && (
              <Text style={styles.teacherLine}>
                Under the guidance of <Text style={styles.teacherName}>{teacherName}</Text>
              </Text>
            )}

            <View style={styles.footerRow}>
              <View style={styles.footerBlock}>
                <Text style={styles.footerValue}>{dateLabel}</Text>
                <View style={styles.footerLine} />
                <Text style={styles.footerLabel}>DATE ISSUED</Text>
              </View>

              <View style={styles.seal}>
                <Svg width={44} height={44}>
                  <Path
                    d={diamondPath(22, 22, 17)}
                    stroke={COLORS.brass}
                    strokeWidth={1.5}
                    fill="none"
                  />
                  <Path
                    d={diamondPath(22, 22, 10)}
                    stroke={COLORS.brassLight}
                    strokeWidth={1}
                    fill="none"
                  />
                </Svg>
              </View>

              <View style={styles.footerBlock}>
                <Text style={styles.footerValue}>MYM-{shortId}</Text>
                <View style={styles.footerLine} />
                <Text style={styles.footerLabel}>CERTIFICATE ID</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function renderCertificatePdf(data: CertificateData): Promise<Buffer> {
  registerFonts();
  return renderToBuffer(<CertificateDocument {...data} />);
}
