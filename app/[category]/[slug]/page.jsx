"use client";
import Loading from "@/app/loading";
import axios from "axios";
import React, { useEffect, useState } from "react";

const Slugpage = () => {
  const [detailArticles, setDetailArticle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    try {
      const response = await axios.get("http://localhost:8080/articles");
      console.log("-----------------", response.data.data);
      if (response.data.status === "success") {
        setDetailArticle(response.data.data);
      }
    } catch (error) {
      console.log(error);
      setError(<Loading />);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  return (
    <div>
    </div>
  );
};

export default Slugpage;
