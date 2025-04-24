import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { Suspense } from "react";

const styles = StyleSheet.create({
  page: {
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 20,
    fontSize: 10,
    fontFamily: "Times-Roman",
    position: "relative",
  },
  pageBorder: {
    position: "absolute",
    top: 15,
    left: 15,
    right: 15,
    bottom: 15,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000000",
    pointerEvents: "none",
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000000",
    borderStyle: "solid",
    fontSize: 10,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCol: {
    flex: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000000",
    borderStyle: "solid",
    padding: 4,
  },
  lastCol: {
    borderRightWidth: 0,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  tableColFirst: {
    flex: 4,
  },
  tableHeader: {
    fontWeight: "bold",
    textAlign: "center",
  },
  tableCell: {
    textAlign: "center",
  },
  title: {
    fontWeight: "bold",
    fontSize: 11,
    marginBottom: 5,
    padding: 3,
    backgroundColor: "#f0f0f0",
    borderBottom: "1pt solid #000000",
  },
  section: {
    marginBottom: 10,
    paddingBottom: 5,
    borderStyle: "solid",
    borderBottomWidth: 0.5,
    borderColor: "#CCCCCC",
  },
  infoSection: {
    marginBottom: 15,
    padding: 8,
    borderStyle: "solid",
    borderWidth: 0.5,
    borderColor: "#CCCCCC",
    borderRadius: 4,
  },
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderStyle: "solid",
    borderTopWidth: 1,
    borderColor: "#000000",
  },
});

export function AssessmentForm() {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.pageBorder} />
        <View
          style={{
            padding: 20,
          }}
        >
          <Image
            style={{
              width: "70%",
              height: "auto",
              marginBottom: 10,
              marginLeft: "auto",
              marginRight: "auto",
            }}
            src={"/djsce.png"}
          />
          <Text
            style={{
              textAlign: "center",
              fontSize: 14,
              fontWeight: "bold",
              textDecoration: "underline",
            }}
          >
            Continuous Assessment for Laboratory / Assignment sessions
          </Text>
          <Text
            style={{
              textAlign: "center",
              fontSize: 12,
              margin: 5,
            }}
          >
            Academic Year: 2024 - 2025
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              marginBottom: 10,
              marginTop: 10,
              fontSize: 12,
            }}
          >
            <Text style={{ width: "48%", marginBottom: 5 }}>
              Name: Ayush Vinod Upadhyay
            </Text>
            <Text style={{ width: "48%", marginBottom: 5 }}>
              SAP ID: 60003220131
            </Text>
            <Text style={{ width: "48%", marginBottom: 5 }}>
              Course: Data Warehousing and Mining
            </Text>
            <Text style={{ width: "48%", marginBottom: 5 }}>
              Course Code: DJS221TL503
            </Text>
            <Text style={{ width: "48%", marginBottom: 5 }}>
              Year: T. Y. B. Tech
            </Text>
            <Text style={{ width: "48%", marginBottom: 5 }}>Sem: V</Text>
            <Text style={{ width: "48%", marginBottom: 5 }}>Batch: T1-2</Text>
            <Text style={{ width: "48%", marginBottom: 5 }}>
              Department: Information Technology
            </Text>
          </View>

          <View
            style={{
              marginBottom: 5,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Performance Indicators
            </Text>
            <Text
              style={{
                textAlign: "center",
                fontSize: 10,
                marginBottom: 2,
              }}
            >
              (Any no. of Indicators, Maximum 5 marks per indicator)
            </Text>
          </View>

          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text
                style={[
                  styles.tableCol,
                  styles.tableColFirst,
                  styles.tableHeader,
                ]}
              >
                Course Outcome
              </Text>
              {[...Array(9)].map((_, i) => (
                <Text key={i} style={[styles.tableCol, styles.tableHeader]}>
                  {i + 1}
                </Text>
              ))}
              <Text
                style={[styles.tableCol, styles.lastCol, styles.tableHeader]}
              >
                10
              </Text>
            </View>

            {[
              "1. Knowledge (Factual/Conceptual/Procedural/Metacognitive)",
              "2. Describe (Factual/Conceptual/Procedural/Metacognitive)",
              "3. Demonstration (Factual/Conceptual/Procedural/Metacognitive)",
              "4. Strategy (Analyse & Evaluate) (Factual/Conceptual/Procedural/Metacognitive)",
              "5. Interpret/Develop (Factual/Conceptual/Procedural/Metacognitive)",
              "6. Attitude towards learning (receiving, attending, responding, valuing, organizing)",
            ].map((label, idx) => (
              <View style={styles.tableRow} key={idx}>
                <Text style={[styles.tableCol, styles.tableColFirst]}>
                  {label}
                </Text>
                {[...Array(9)].map((_, i) => (
                  <Text key={i} style={[styles.tableCol, styles.tableCell]}>
                    {" "}
                  </Text>
                ))}
                <Text
                  style={[styles.tableCol, styles.lastCol, styles.tableCell]}
                >
                  {" "}
                </Text>
              </View>
            ))}

            {/* Last row with special styling */}
            <View style={styles.tableRow}>
              <Text
                style={[styles.tableCol, styles.tableColFirst, styles.lastRow]}
              >
                7. Non-verbal communication skills/ Behavioural skills (motor
                skills, hand-eye coordination, gross body movements, finely
                coordinated body movements speech behaviours)
              </Text>
              {[...Array(9)].map((_, i) => (
                <Text
                  key={i}
                  style={[styles.tableCol, styles.tableCell, styles.lastRow]}
                >
                  {" "}
                </Text>
              ))}
              <Text
                style={[
                  styles.tableCol,
                  styles.lastCol,
                  styles.tableCell,
                  styles.lastRow,
                ]}
              >
                {" "}
              </Text>
            </View>
          </View>
          <View
            style={{
              marginBottom: 10,
              marginTop: 5,
              fontSize: 10,
              textAlign: "center",
            }}
          >
            <Text>
              Outstanding (5), Excellent (4), Good (3), Fair (2), Needs
              Improvement (1)
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              marginBottom: 10,
              marginTop: 10,
              fontSize: 12,
              gap: 20,
            }}
          >
            <Text style={{ width: "48%", marginBottom: 5 }}>
              Sign of the Student:
            </Text>
            <Text style={{ width: "48%", marginBottom: 5 }}>Total Marks:</Text>
            <Text style={{ width: "48%", marginBottom: 5 }}>
              Sign of the Faculty member:
            </Text>
            <Text style={{ width: "48%", marginBottom: 5 }}>
              Sign of Head of the Department:
            </Text>
            <Text style={{ width: "48%", marginBottom: 5 }}>
              Faculty Name: Dr. Vinaya Sawant
            </Text>
            <Text style={{ width: "48%", marginBottom: 5 }}>
              Date: 19/11/24
            </Text>
          </View>

          <View
            style={{
              marginTop: 25,
              textAlign: "center",
            }}
          >
            <Text style={{ fontSize: 8 }}>
              Plot No. U-15, J.V.P.D. Scheme, Bhaktivedanta Swami Marg, Vile
              Parle (W), Mumbai - 400056
            </Text>
            <Text style={{ fontSize: 8 }}>
              Phone: 42335000 / 42335001 Email: dj@djsce.ac.in |
              admissions@djsce.ac.in Website: www.djsce.ac.in
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
