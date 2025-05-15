import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { Suspense } from "react";

// Define type for props
interface AssessmentFormProps {
  studentData?: {
    name: string;
    sapId: string;
    rollNo: string;
    batch: string;
  };
  classData?: {
    courseName: string;
    courseCode: string;
    academicYear: string;
    year: string;
    semester: string;
    department: string;
    facultyName: string;
    indicators?: string[];
  };
  totalMarks?: number | null;
  experiments?: {
    [key: string]: { [key: string]: number };
  };
  experimentTotals?: {
    [key: string]: number;
  };
}

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
    flex: 2.5,
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

export function AssessmentForm({
  studentData,
  classData,
  totalMarks,
  experiments,
  experimentTotals,
}: AssessmentFormProps) {
  // Use props if they exist, otherwise fallback to default values
  const name = studentData?.name || "Ayush Vinod Upadhyay";
  const sapId = studentData?.sapId || "60003220131";
  const rollNo = studentData?.rollNo || "";
  const batch = studentData?.batch || "T1-2";
  const course = classData?.courseName || "Data Warehousing and Mining";
  const code = classData?.courseCode || "DJS221TL503";
  const year = classData?.year || "T. Y. B. Tech";
  const semester = classData?.semester || "V";
  const department = classData?.department || "Information Technology";
  const facultyName = classData?.facultyName || "Dr. Vinaya Sawant";
  const acYear = classData?.academicYear || "2024 - 2025";
  const totalMarksFormatted =
    totalMarks !== null && totalMarks !== undefined
      ? totalMarks.toFixed(2)
      : "";

  // Use only the indicators from classData
  const indicators = classData?.indicators || [];
  
  // Maximum number of indicators to display in the table
  const MAX_INDICATORS_TO_DISPLAY = 7;
  
  // Determine how many indicators to actually display (limited to max)
  const indicatorsToDisplay = Math.min(indicators.length, MAX_INDICATORS_TO_DISPLAY);
  
  // Helper function to find indicator value
  const getIndicatorValue = (expKey: string, indicator: string) => {
    if (!experiments || !expKey) return undefined;
    
    const exp = experiments[expKey];
    if (!exp) return undefined;
    
    // Try exact match first
    if (exp[indicator] !== undefined) {
      return exp[indicator];
    }
    
    // Try matching by number
    const indicatorNumber = indicator.match(/^\d+/)?.[0];
    if (indicatorNumber && exp[indicatorNumber] !== undefined) {
      return exp[indicatorNumber];
    }
    
    return undefined;
  };
  
  // Get list of experiments and sort them numerically
  const experimentKeys = experiments ? Object.keys(experiments)
    .sort((a, b) => {
      // Extract numbers from experiment keys (e.g., "Exp1" -> 1)
      const numA = parseInt(a.replace(/\D/g, ''));
      const numB = parseInt(b.replace(/\D/g, ''));
      return numA - numB;
    }) : [];
  
  // Get experiment column count (limited to 10 for space)
  const experimentCount = Math.min(experimentKeys.length, 10);

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
            src="/djsce.png"
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
            Academic Year: {acYear}
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
            <Text style={{ width: "48%", marginBottom: 5 }}>Name: {name}</Text>
            <Text style={{ width: "48%", marginBottom: 5 }}>
              SAP ID: {sapId}
            </Text>
            <Text style={{ width: "48%", marginBottom: 5 }}>
              Course: {course}
            </Text>
            <Text style={{ width: "48%", marginBottom: 5 }}>
              Course Code: {code}
            </Text>
            <Text style={{ width: "48%", marginBottom: 5 }}>Year: {year}</Text>
            <Text style={{ width: "48%", marginBottom: 5 }}>
              Sem: {semester}
            </Text>
            <Text style={{ width: "48%", marginBottom: 5 }}>
              Batch: {batch}
            </Text>
            <Text style={{ width: "48%", marginBottom: 5 }}>
              Department: {department}
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
              {Array.from({ length: experimentCount }, (_, i) => {
                const expKey = experimentKeys[i];
                // Extract experiment number from key (e.g., "Exp10" -> "10")
                const expNumber = expKey ? expKey.replace(/\D/g, '') : (i + 1).toString();
                return (
                  <Text key={i} style={[styles.tableCol, styles.tableHeader]}>
                    {expNumber}
                  </Text>
                );
              })}
              {experimentCount < 10 &&
                Array.from({ length: 10 - experimentCount }, (_, i) => (
                  <Text key={i + experimentCount} style={[styles.tableCol, styles.tableHeader]}>
                    {i + experimentCount + 1}
                  </Text>
                ))
              }
            </View>

            {/* Safe rendering of indicator rows */}
            {indicators.slice(0, indicatorsToDisplay).map((label, idx) => {
              const isLastRow = idx === indicatorsToDisplay - 1;
              if (!label) return null;
              return (
                <View style={styles.tableRow} key={idx}>
                  <Text style={[
                    styles.tableCol,
                    styles.tableColFirst,
                    isLastRow ? styles.lastRow : {}
                  ]}>
                    {label}
                  </Text>
                  {Array.from({ length: experimentCount }, (_, i) => {
                    try {
                      const expKey = experimentKeys[i];
                      const value = getIndicatorValue(expKey, label);
                      return (
                        <Text key={i} style={[
                          styles.tableCol,
                          styles.tableCell,
                          isLastRow ? styles.lastRow : {}
                        ]}>
                          {value !== undefined ? value : " "}
                        </Text>
                      );
                    } catch (err) {
                      console.error(`Error rendering cell: ${err}`);
                      return (
                        <Text key={i} style={[
                          styles.tableCol,
                          styles.tableCell,
                          isLastRow ? styles.lastRow : {}
                        ]}>
                          {" "}
                        </Text>
                      );
                    }
                  })}
                  {experimentCount < 10 &&
                    Array.from({ length: 10 - experimentCount }, (_, i) => (
                      <Text key={i + experimentCount} style={[
                        styles.tableCol,
                        styles.tableCell,
                        isLastRow ? styles.lastRow : {}
                      ]}>
                        {" "}
                      </Text>
                    ))
                  }
                </View>
              );
            })}

            {/* Only show default last row if no indicators exist */}
            {indicators.length === 0 && (
              <View style={styles.tableRow}>
                <Text
                  style={[styles.tableCol, styles.tableColFirst, styles.lastRow]}
                >
                  No performance indicators defined for this class
                </Text>
                {Array.from({ length: 10 }, (_, i) => (
                  <Text 
                    key={i} 
                    style={[styles.tableCol, styles.tableCell, styles.lastRow]}
                  >
                    {" "}
                  </Text>
                ))}
              </View>
            )}
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
            <Text style={{ width: "48%", marginBottom: 5 }}>
              Total Marks: {totalMarksFormatted}
            </Text>
            <Text style={{ width: "48%", marginBottom: 5 }}>
              Sign of the Faculty member:
            </Text>
            <Text style={{ width: "48%", marginBottom: 5 }}>
              Sign of Head of the Department:
            </Text>
            <Text style={{ width: "48%", marginBottom: 5 }}>
              Faculty Name: {facultyName}
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
