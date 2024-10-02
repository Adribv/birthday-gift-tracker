import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import "./App.css";

function App() {
  const [selectedPerson, setSelectedPerson] = useState("");
  const [contributions, setContributions] = useState([]);
  const [contributorName, setContributorName] = useState("");
  const [amount, setAmount] = useState("");
  const [totalCollected, setTotalCollected] = useState(0);
  const [totalReceived, setTotalReceived] = useState(0);
  const [totalPending, setTotalPending] = useState(0);

  useEffect(() => {
    if (selectedPerson) {
      fetchContributions(selectedPerson);
    }
  }, [selectedPerson]);

  const fetchContributions = async (person) => {
    const querySnapshot = await getDocs(collection(db, person));
    let fetchedContributions = [];
    let collected = 0;
    let received = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      fetchedContributions.push({ ...data, id: doc.id });
      collected += data.amount;
      if (data.received) {
        received += data.amount;
      }
    });

    setContributions(fetchedContributions);
    setTotalCollected(collected);
    setTotalReceived(received);
    setTotalPending(collected - received);
  };

  const handleAddContribution = async () => {
    if (selectedPerson && contributorName && amount) {
      const newContribution = {
        contributorName,
        amount: parseFloat(amount),
        received: false,
      };
      await addDoc(collection(db, selectedPerson), newContribution);
      fetchContributions(selectedPerson);
      setContributorName("");
      setAmount("");
    }
  };

  const handleToggleReceived = async (id, currentStatus) => {
    await updateDoc(doc(db, selectedPerson, id), { received: !currentStatus });
    fetchContributions(selectedPerson);
  };

  const handleDeleteContribution = async (id) => {
    await deleteDoc(doc(db, selectedPerson, id));
    fetchContributions(selectedPerson);
  };

  return (
    <div className="App container mt-4">
      <header className="App-header mb-4">
        <h1>Birthday Gift Fundraiser</h1>
        <div className="form-group my-4">
          <select
            className="form-control"
            value={selectedPerson}
            onChange={(e) => setSelectedPerson(e.target.value)}
          >
            <option value="" disabled>Select a person</option>
            <option value="Harini">Harini</option>
            <option value="Bhubesh">Bhubesh</option>
            <option value="Bhairav">Bhairav</option>
          </select>
        </div>

        {selectedPerson && (
          <>
            <div className="total-collected alert alert-info">
              <h3>Total Collected for {selectedPerson}: ₹{totalCollected}</h3>
              <h4>Total Received: ₹{totalReceived}</h4>
              <h4>Pending Amount: ₹{totalPending}</h4>
            </div>
            <div className="contribution-form mb-4">
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  value={contributorName}
                  onChange={(e) => setContributorName(e.target.value)}
                  placeholder="Contributor Name"
                />
                <input
                  type="number"
                  className="form-control"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount in ₹"
                />
                <button
                  className="btn btn-success"
                  onClick={handleAddContribution}
                >
                  Add Contribution
                </button>
              </div>
            </div>
            <div className="contributions-list">
              {contributions.length > 0 ? (
                <div className="list-group">
                  {contributions.map((contribution) => (
                    <div
                      key={contribution.id}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <h5>{contribution.contributorName}</h5>
                        <p>Amount: ₹{contribution.amount}</p>
                        <p>Status: {contribution.received ? "Received" : "Not Received"}</p>
                      </div>
                      <div>
                        <button
                          className={`btn btn-sm ${contribution.received ? "btn-warning" : "btn-primary"} me-2`}
                          onClick={() =>
                            handleToggleReceived(contribution.id, contribution.received)
                          }
                        >
                          Mark as {contribution.received ? "Not Received" : "Received"}
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteContribution(contribution.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-secondary">No contributions yet.</div>
              )}
            </div>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
