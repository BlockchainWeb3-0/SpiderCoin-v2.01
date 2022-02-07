import axios from "axios";
import { useEffect, useState } from "react";

const useAxios = (axiosParams) => {
  const [data, setData] = useState(undefined);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async (params) => {
    try {
      const result = await axios(params);
      setData(result.data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData(axiosParams);
  }, []);

  return { data, error, loading };
};

export default useAxios;
