import { useEffect, useState } from "react";

export default function EstimateForm() {
  const [url, setUrl] = useState("");
  const [postcode, setPostcode] = useState(localStorage.getItem("postcode") || "");
  const [quantity, setQuantity] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [includePackaging, setIncludePackaging] = useState(true);
  const [equivalenceView, setEquivalenceView] = useState(0);
  const [selectedMode, setSelectedMode] = useState("Ship");

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0]?.url || "";
      if (currentUrl.includes("amazon.co.uk")) {
        setUrl(currentUrl);
      }
    });
<<<<<<< HEAD
    
=======
  }, []);

  useEffect(() => {
>>>>>>> 90966f83 (Fix weight logic and distance values in estimate_emissions endpoint)
    if (result) {
      console.log("Complete result object:", result);
    }
  }, [result]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    localStorage.setItem("postcode", postcode);

    try {
      const res = await fetch("http://127.0.0.1:5000/estimate_emissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amazon_url: url,
          postcode: postcode,
          include_packaging: includePackaging,
<<<<<<< HEAD
          override_transport_mode: selectedMode,
        }),
      });
    
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Server error: ${res.status} - ${errorText}`);
        throw new Error(errorText);
      }
    
      // Instead of directly setting result, process the response to ensure distances are handled
      const rawData = await res.json();
      console.log("Raw API response:", rawData);
      
      // Create a processed version with guaranteed distance values
      const processedData = {
        ...rawData,
        data: {
          ...rawData.data,
          attributes: {
            ...rawData.data?.attributes,
            // Ensure distance values exist - use whatever is available
            intl_distance_display: 
              typeof rawData.data?.attributes?.intl_distance_km === 'number' 
                ? `${rawData.data.attributes.intl_distance_km} km`
                : "Unknown km",
            uk_distance_display: 
              typeof rawData.data?.attributes?.uk_distance_km === 'number'
                ? `${rawData.data.attributes.uk_distance_km} km`
                : "Unknown km"
          }
        }
      };
      
      setResult(processedData);
    } catch (err) {
      console.error("Fetch failed:", err.message);
      setError("Failed to fetch product data. Check console for details.");
=======
        }),
      });

      const data = await res.json();
      console.log("✅ Received:", data);
      if (!res.ok) throw new Error(data.error || "Unknown error");

      setResult(data.data.attributes);
    } catch (err) {
      console.error("❌ Network/JS error:", err);
      alert("Failed to contact backend for emissions data.\n\n" + err.message);
      setError("Fetch failed — check your network or backend server.");
>>>>>>> 90966f83 (Fix weight logic and distance values in estimate_emissions endpoint)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "Arial" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
        <button 
          onClick={() => document.body.classList.toggle("dark-mode")}
          style={{ backgroundColor: "#f0f0f0", border: "none", borderRadius: "20px", padding: "8px 16px" }}
        >
          🌓 Toggle Theme
        </button>
      </div>

      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "10px", textAlign: "center" }}>
        Amazon Shipping <br />
        Emissions Estimator
      </h2>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>
          Change Shipping Mode:
          <select 
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            style={{ marginLeft: "10px", padding: "4px" }}
          >
            <option value="Ship">Ship 🚢</option>
            <option value="Air">Air ✈️</option>
            <option value="Truck">Truck 🚚</option>
          </select>
        </label>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Amazon product URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ display: "block", marginBottom: "6px", width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
        />
        <input
          type="text"
          placeholder="Enter your postcode"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          style={{ display: "block", marginBottom: "6px", width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
        />
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          style={{ display: "block", marginBottom: "6px", width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
        />
        <label style={{ display: "block", marginBottom: "6px" }}>
          <input
            type="checkbox"
            checked={includePackaging}
            onChange={(e) => setIncludePackaging(e.target.checked)}
          /> Include packaging weight
          <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
            (20% estimated extra weight for packaging)
          </div>
        </label>
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            display: "block", 
            width: "100%", 
            padding: "10px", 
            backgroundColor: "#2e7d32", 
            color: "white", 
            border: "none", 
            borderRadius: "4px",
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "Estimating..." : "Estimate Emissions"}
        </button>
      </form>

      {error && <p style={{ color: "red", textAlign: "center", marginTop: "10px" }}>{error}</p>}

      {result && (
<<<<<<< HEAD
        <div style={{ marginTop: "20px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "8px", padding: "15px", backgroundColor: "#f9f9f9" }}>
          <h3 style={{ textAlign: "center", marginBottom: "15px" }}>🎁 Amazon Product</h3>
          
          <p><strong>Origin:</strong> {result.data?.attributes?.origin || "Unknown"} → UK → You</p>
          
          {/* Use pre-processed display values that are guaranteed to exist */}
          <p><strong>Intl Distance:</strong> {result.data?.attributes?.intl_distance_display}</p>
          <p><strong>UK Distance:</strong> {result.data?.attributes?.uk_distance_display}</p>
          
          <p>
            <strong>Transport Mode:</strong> {result.data?.attributes?.transport_mode || selectedMode} {
              selectedMode === "Ship" ? "🚢" : selectedMode === "Air" ? "✈️" : "🚚"
            }
          </p>
          
          <p>
            <strong>Weight:</strong> {result.data?.attributes?.weight_kg || "Unknown"} kg
            {result.data?.attributes?.raw_product_weight_kg && (
              <span style={{ fontSize: "12px", display: "block", marginLeft: "20px", color: "#666" }}>
                ({result.data.attributes.raw_product_weight_kg} kg product only)
              </span>
            )}
          </p>
          
          <p>
            <strong>Carbon:</strong> {result.data?.attributes?.carbon_kg || "Unknown"} kg CO₂
          </p>
          
          <p>
            <strong>Eco Score:</strong> {
              result.data?.attributes?.eco_score_ml 
                ? result.data.attributes.eco_score_ml.split(" ")[0]
                : "Unknown"
            }
          </p>
          
          <div style={{ marginTop: "15px", textAlign: "center" }}>
            <button 
              onClick={() => setEquivalenceView((prev) => (prev + 1) % 3)}
              style={{ 
                padding: "6px 12px", 
                backgroundColor: "#f0f0f0", 
                border: "1px solid #ddd", 
                borderRadius: "4px" 
              }}
            >
              🔄 Impact Equivalent
=======
        <div style={{ marginTop: "1rem", fontSize: "14px" }}>
          <h3>📦 <strong>{result.title}</strong></h3>
          <p><strong>Eco Score (ML):</strong> {result.eco_score_ml || "N/A"}</p>
          <p><strong>Eco Score (Rule-Based):</strong> {result.eco_score || "N/A"}</p>
          <p><strong>Material Type:</strong> {result.material_type || "N/A"}</p>
          <p><strong>Transport Mode:</strong> {result.selected_mode || result.transport_mode}</p>
          <p><strong>Weight (incl. packaging):</strong> {result.weight_kg} kg</p>
          <p><strong>Carbon Emissions:</strong> {result.carbon_kg} kg CO₂</p>

          <p><strong>Intl Distance:</strong> {
            Number.isFinite(parseFloat(result?.distance_from_origin_km))
              ? `${parseFloat(result.distance_from_origin_km).toFixed(1)} km`
              : "❌ Invalid"
          }</p>

          <p><strong>UK Distance:</strong> {
            Number.isFinite(parseFloat(result?.distance_from_uk_hub_km))
              ? `${parseFloat(result.distance_from_uk_hub_km).toFixed(1)} km`
              : "❌ Invalid"
          }</p>

          <pre style={{ fontSize: "12px", backgroundColor: "#f9f9f9", padding: "0.5rem" }}>
            {JSON.stringify(result, null, 2)}
          </pre>

          {/* Optional ML chart, if implemented */}
          {/* <MLChart mlScore={result.eco_score_ml} carbonKg={result.carbon_kg} /> */}

          <div style={{ marginTop: "10px" }}>
            <button onClick={() => setEquivalenceView((prev) => (prev + 1) % 3)}>
              🔁 Show another comparison
>>>>>>> 90966f83 (Fix weight logic and distance values in estimate_emissions endpoint)
            </button>
            
            <div style={{ marginTop: "8px", fontStyle: "italic" }}>
              {equivalenceView === 0 && result.data?.attributes?.trees_to_offset && (
                <span>≈ {result.data.attributes.trees_to_offset} trees to offset</span>
              )}
              {equivalenceView === 1 && result.data?.attributes?.carbon_kg && (
                <span>≈ {(result.data.attributes.carbon_kg * 4.6).toFixed(1)} km driven</span>
              )}
              {equivalenceView === 2 && result.data?.attributes?.carbon_kg && (
                <span>≈ {Math.round(result.data.attributes.carbon_kg / 0.011)} kettles boiled</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}