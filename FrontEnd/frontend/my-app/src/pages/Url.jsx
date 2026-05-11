import { useEffect, useState } from "react";
import { Table, Form, Button } from "react-bootstrap";
import './Url.css';

function Url() {
  const [urls, setUrls] = useState([]);
  const [newUrl, setNewUrl] = useState({ url: '' });
  const [urlError, setUrlError] = useState("");

  // grabs urls for user using fetch
  useEffect(() => {
    fetchSavedUrls();
  }, []);

  // fetches URLs from backend for current user
  const fetchSavedUrls = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(`http://localhost:8081/urls?userId=${userId}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setUrls(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch error:", error);
      setUrls([]);
    }
  };

  // handles input changes for the URL entry field
  const handleNewUrlChange = (e) => {
    const value = e.target.value.trimStart();
    setNewUrl({ ...newUrl, [e.target.name]: value });

    if (urlError && validateAndNormalizeUrl(value)) {
      setUrlError("");
    }
  };

  // updates URL or name inline in the saved URLs table (blur)
  const handleSavedUrlChange = (id, field, value) => {
    setUrls(urls.map(url =>
      url.url_id === id ? { ...url, [field]: value } : url
    ));
  };

  // (adds https:// if missing) basic validation and normalization for urls, similar to how a browser does it. Unsure
  // about further validation as URLs get tricky especially if theyre insecure. 
  const validateAndNormalizeUrl = (input) => {
    try {
      let trimmed = input.trim();
      if (!/^https?:\/\//i.test(trimmed)) {
        trimmed = 'https://' + trimmed;
      }

      const regex = /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/;
      if (!regex.test(trimmed)) return null;

      const url = new URL(trimmed); // browser-safe parsing
      return url.toString();
    } catch (err) {
      return null;
    }
  };

  // Adds a new validated URL and sends it to the backend
  const handleSaveNewUrl = async (e) => {
    e.preventDefault();

    const normalized = validateAndNormalizeUrl(newUrl.url);

    if (!normalized) {
      setUrlError("Please enter a valid URL before saving.");
      return;
    }

    setUrlError("");

    const userId = localStorage.getItem("userId");

    try {
      const response = await fetch(`http://localhost:8081/urls?userId=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized })
      });

      if (!response.ok) {
        setUrlError("Failed to save the URL. Please try again.");
        return;
      }

      fetchSavedUrls();
      setNewUrl({ url: '' }); // clear field only on success

    } catch (err) {
      console.error("Error adding URL:", err);
      setUrlError("An error occurred. Please try again.");
    }
  };

  // main analysis function, uses urlcontroller backend, doesnt save.
  const analyzeUnsavedUrl = async () => {
    const normalized = validateAndNormalizeUrl(newUrl.url);
    if (!normalized) {
      setUrlError("Please enter a valid URL before scanning.");
      return;
    }
    setUrlError("");

    try {
      const response = await fetch(`http://localhost:8081/analyze?targetUrl=${encodeURIComponent(normalized)}`);
      if (!response.ok) {
        setUrlError("Scan analysis failed.");
        return;
      }

      const analysisData = await response.json();

      sessionStorage.setItem('latestAnalysis', JSON.stringify({
        analysis: analysisData,
        originalUrl: normalized
      }));

      window.open(`/analysis`, '_blank');
    } catch (err) {
      console.error("Error during Scan:", err);
    }
  };

  // updates a single URL or name field by ID (used after blur on table input)
  const updateSavedUrl = (id) => {
    const urlToUpdate = urls.find(url => url.url_id === id);
    fetch(`http://localhost:8081/urls/${id}?userId=${localStorage.getItem("userId")}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(urlToUpdate)
    })
      .then(res => {
        if (res.ok) fetchSavedUrls();
      });
  };

  // deletes a saved URL by ID
  const deleteSavedUrl = async (id) => {
    try {
      const response = await fetch(`http://localhost:8081/urls/${id}?userId=${localStorage.getItem("userId")}`, {
        method: "DELETE"
      });
      if (response.ok) {
        setUrls(urls.filter(url => url.url_id !== id));
      } else {
        console.error("Delete failed with status:", response.status);
      }
    } catch (error) {
      console.error("Error deleting URL:", error);
    }
  };

  // rescans a saved URL by opening a new tab with analysis
  const handleRescanSavedUrl = (id) => {
    window.open(`/analysis?urlId=${id}`, '_blank');
  };

  return (
    <div className="url-page-container">
      <div className="url-form-container">
        <Form onSubmit={handleSaveNewUrl}>
          <h4>Submit URL for Analysis</h4>
          <Form.Group className="mb-3">
            <Form.Label>URL</Form.Label>
            <Form.Control
              type="text"
              name="url"
              value={newUrl.url}
              onChange={handleNewUrlChange}
              required
            />
            {urlError && (
              <div style={{ color: 'red', fontSize: '14px', marginTop: '4px' }}>
                {urlError}
              </div>
            )}
          </Form.Group>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="success" type="submit">
              Save
            </Button>
            <Button variant="info" type="button" onClick={analyzeUnsavedUrl}>
              Scan
            </Button>
          </div>
        </Form>
      </div>

      <div className="url-table-container">
        <h4>Saved URLs</h4>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>URL</th>
              <th style={{ width: '200px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(urls) && urls.length > 0 ? (
              urls.map(url => (
                <tr key={url.url_id}>
                  <td>
                    <Form.Control
                      type="text"
                      value={url.name || ''}
                      onChange={(e) => handleSavedUrlChange(url.url_id, 'name', e.target.value)}
                      onBlur={() => updateSavedUrl(url.url_id)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      value={url.url || ''}
                      onChange={(e) => handleSavedUrlChange(url.url_id, 'url', e.target.value)}
                      onBlur={() => updateSavedUrl(url.url_id)}
                    />
                  </td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteSavedUrl(url.url_id)}
                      className="me-2"
                    >
                      Delete
                    </Button>
                    <Button
                        variant="info"
                        size="sm"
                        onClick={() => handleRescanSavedUrl(url.url_id)}
                      >
                        Rescan
                      </Button>

                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">
                  No URLs found. Add one using the form.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default Url;
