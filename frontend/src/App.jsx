
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useNavigate,
  useParams,
} from "react-router-dom";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000/api/feedback";

// Dashboard
function Dashboard() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    try {
      const response = await axios.get(API);
      setFeedback(response.data);
    } catch (error) {
      alert("Unable to load feedback. Check the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const deleteFeedback = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) {
      return;
    }

    try {
      await axios.delete(`${API}/${id}`);
      setFeedback(feedback.filter((item) => item._id !== id));
    } catch (error) {
      alert("Unable to delete feedback.");
    }
  };

  return (
    <div className="container">
      <div className="page-heading">
        <div>
          <h1>Feedback Dashboard</h1>
          <p>Manage and review course feedback.</p>
        </div>

        <NavLink to="/add-feedback" className="primary-btn">
          + Add Feedback
        </NavLink>
      </div>

      <div className="table-container">
        {loading ? (
          <p className="message">Loading feedback...</p>
        ) : feedback.length === 0 ? (
          <p className="message">
            No feedback available. Add your first feedback!
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Course ID</th>
                <th>Course Name</th>
                <th>Duration</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {feedback.map((item) => (
                <tr key={item._id}>
                  <td>{item.courseId}</td>
                  <td>
                    <strong>{item.courseName}</strong>
                    <p className="comment">
                      {item.feedbackComments}
                    </p>
                  </td>
                  <td>{item.courseDuration}</td>
                  <td>
                    <span className="rating">
                      {"★".repeat(item.feedbackRating)}
                      {"☆".repeat(5 - item.feedbackRating)}
                    </span>
                    <span className="rating-number">
                      {item.feedbackRating}/5
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <NavLink
                        to={`/edit-feedback/${item._id}`}
                        className="edit-btn"
                      >
                        Update
                      </NavLink>

                      <button
                        className="delete-btn"
                        onClick={() => deleteFeedback(item._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Add and Update Feedback Form
function FeedbackForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [courseName, setCourseName] = useState("");
  const [feedbackComments, setFeedbackComments] = useState("");
  const [feedbackRating, setFeedbackRating] = useState("5");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      axios
        .get(API)
        .then((response) => {
          const item = response.data.find(
            (feedback) => feedback._id === id
          );

          if (item) {
            setCourseName(item.courseName);
            setFeedbackComments(item.feedbackComments);
            setFeedbackRating(String(item.feedbackRating));
          } else {
            alert("Feedback not found.");
            navigate("/");
          }
        })
        .catch(() => alert("Unable to load feedback."));
    }
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      courseName,
      feedbackComments,
      feedbackRating: Number(feedbackRating),
    };

    try {
      if (id) {
        await axios.put(`${API}/${id}`, data);
        alert("Feedback updated successfully!");
      } else {
        await axios.post(API, data);
        alert("Feedback added successfully!");
      }

      navigate("/");
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-heading">
        <h1>{id ? "Update Feedback" : "Add Feedback"}</h1>
        <p>
          {id
            ? "Edit your submitted course feedback."
            : "Share your experience with the course."}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <label>Course Name</label>

        <input
          type="text"
          placeholder="Enter course name"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          required
        />

        <label>Feedback Comments</label>

        <textarea
          placeholder="Write your feedback..."
          value={feedbackComments}
          onChange={(e) => setFeedbackComments(e.target.value)}
          rows="5"
          required
        />

        <label>Feedback Rating</label>

        <select
          value={feedbackRating}
          onChange={(e) => setFeedbackRating(e.target.value)}
          required
        >
          <option value="5">5 - Excellent</option>
          <option value="4">4 - Very Good</option>
          <option value="3">3 - Good</option>
          <option value="2">2 - Average</option>
          <option value="1">1 - Poor</option>
        </select>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/")}
          >
            Cancel
          </button>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading
              ? "Saving..."
              : id
              ? "Update Feedback"
              : "Submit Feedback"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Main Application
function AppLayout() {
  return (
    <>
      <nav className="navbar">
        <NavLink to="/" className="brand">
          Feedback<span>Hub</span>
        </NavLink>

        <div className="nav-links">
          <NavLink to="/" end>
            Dashboard
          </NavLink>

          <NavLink to="/add-feedback">
            Add Feedback
          </NavLink>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add-feedback" element={<FeedbackForm />} />
        <Route path="/edit-feedback/:id" element={<FeedbackForm />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
