export const apiOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startId: '1',
      endId: '10',
    }),
  };
  
  export const fetchData = async (url, options) => {
    const res = await fetch(url, options);
    const data = await res.json();
  
    return data;
  };
  
  const apiUrl = 'https://us-central1-rocmap.cloudfunctions.net/findDirection';
  
  const fetchDataAndLog = async () => {
    try {
      const data = await fetchData(apiUrl, apiOptions);
      console.log(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
  fetchDataAndLog();
  