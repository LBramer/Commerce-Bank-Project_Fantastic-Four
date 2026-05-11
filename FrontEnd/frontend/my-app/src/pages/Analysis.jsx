import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Table, Button } from "react-bootstrap";
import './Analysis.css';

function Analysis() {
  const [sslInfo, setSslInfo] = useState({});
  const [securityHeaders, setSecurityHeaders] = useState([]);
  const [originalUrl, setOriginalUrl] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [error, setError] = useState("");

  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlId = queryParams.get('urlId');

    const loadAnalysis = async () => {
      if (urlId) {
        try {
          const response = await fetch(`http://localhost:8081/analysis?urlId=${urlId}`);
          if (!response.ok) throw new Error("Analysis fetch failed");

          const data = await response.json();
          setSslInfo(data.ssl || {});
          setSecurityHeaders(data.headers || []);
          setOriginalUrl(data.url || `Scanned entry with ID: ${urlId}`);
          setError("");
        } catch (err) {
          console.error("Analysis error:", err);
          setError("Failed to load analysis for URL ID " + urlId);
        }
      } else {
        const stored = sessionStorage.getItem('latestAnalysis');
        if (stored) {
          const parsed = JSON.parse(stored);
          setSslInfo(parsed.analysis.ssl || {});
          setSecurityHeaders(parsed.analysis.headers || []);
          setOriginalUrl(parsed.originalUrl || "");
          setError("");
        } else {
          setError("No analysis data found. Please scan a URL first.");
        }
      }
    };

    loadAnalysis();
  }, [location.search]);

  const saveScannedUrl = async () => {
    const userId = localStorage.getItem("userId");

    try {
      const saveResponse = await fetch(`http://localhost:8081/urls?userId=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: originalUrl })
      });

      if (saveResponse.ok) {
        setSaveMessage("URL saved successfully!");
      } else {
        setSaveMessage("Failed to save URL.");
      }
    } catch (err) {
      console.error("Error saving scanned URL:", err);
      setSaveMessage("Error saving URL.");
    }
  };

  return (
    <div className="analysis-container">
      <div className="analysis-actions">
        <div className="analyzed-url-text">
          {originalUrl ? `Analyzing: ${originalUrl}` : "No URL loaded"}
        </div>

        <Button variant="success" onClick={saveScannedUrl}>
          Save URL
        </Button>

        <Button variant="outline-success" onClick={() => window.location.href = "/urls"}>
          Back to List
        </Button>
      </div>

      {error && (
        <div className="analysis-error">
          {error}
        </div>
      )}

      {saveMessage && (
        <div className="save-message">
          {saveMessage}
        </div>
      )}

      <div className="ssl-info-table">
        <h3>SSL Certificate Information</h3>
        <Table striped bordered>
          <tbody>
            {Object.entries(sslInfo).map(([key, value]) => {
              const isExpiry = key.toLowerCase().includes("expiry");
              const isExpired = isExpiry && Date.parse(value) < Date.now();

              return (
                <tr key={key} style={isExpired ? { backgroundColor: "#ffe6e6" } : {}}>
                  <td><strong>{key}</strong></td>
                  <td style={isExpired ? { color: "red", fontWeight: "bold" } : {}}>
                    {value}
                    {isExpired && " (Expired)"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      <div className="headers-warning-table">
        <h3>Security-Relevant Headers</h3>
        <Table striped bordered>
          <thead>
            <tr><th>Header</th><th>Value</th></tr>
          </thead>
          <tbody>
            {securityHeaders.length === 0 ? (
              <tr><td colSpan="2">No security-relevant headers found.</td></tr>
            ) : (
              securityHeaders.map((header, index) => (
                <tr key={index}>
                  <td>{header.key}</td>
                  <td>{header.value}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default Analysis;
