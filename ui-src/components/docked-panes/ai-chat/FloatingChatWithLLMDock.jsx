import React, { useState, useEffect, useRef } from "react";
import { Send, Check, X } from "lucide-react";
import { generateAssistantMessage } from "../../../../utils/componentLibs.js";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";
import { useModeSocket } from "../../../hooks/useModeSocket.js";

const baseMessage = "Hi! What action would you like me to perform on the page?";

export default function FloatingChatWithLLMDock({ onCancel }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: baseMessage,
    },
  ]);
  const [input, setInput] = useState("");
  const [pendingStep, setPendingStep] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [finalizedSteps, setFinalizedSteps] = useState([]);
  const [animateIcon, setAnimateIcon] = useState(false);
  const [pendingStepsQueue, setPendingStepsQueue] = useState([]);
  const [currentStepNumber, setCurrentStepNumber] = useState(0);
  const [totalStepsFromLLM, setTotalStepsFromLLM] = useState(0);
  const messagesEndRef = useRef(null);

  useModeSocket(onCancel);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendToLLM = async (prompt) => {
    setIsTyping(true); // Start typing
    try {
      // Simulate LLM call or replace with your actual backend API
      const res = await fetch("http://localhost:3111/api/gptchat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      const { steps } = data; // assuming response is the JSON array inside triple backticks
      setTotalStepsFromLLM(steps.length);
      console.log("Response is: ", data);
      if (Array.isArray(steps) && steps.length > 0) {
        const firstStep = steps[0];
        const stepNumber = finalizedSteps.length + 1;

        setPendingStepsQueue(steps.slice(1));
        const stepMsg = {
          role: "assistant",
          content: `I’ve broken your request into ${
            steps.length
          } steps. Let’s go through them one by one.\n\n${generateAssistantMessage(
            firstStep,
            0
          )}`,
          step: firstStep,
          status: "pending",
        };
        const nextIndex = messages.length;
        setMessages((prev) => [...prev, stepMsg]);
        setPendingStep({ step: firstStep, index: nextIndex + 1 });
        setCurrentStepNumber(1);
      } else {
        throw new Error("Invalid or empty step array.");
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Error getting response." + err.message,
        },
      ]);
      setPendingStep(null);
    } finally {
      setIsTyping(false); // Stop typing
    }
  };

  const triggerIconAnimation = () => {
    setAnimateIcon(true);
    setTimeout(() => setAnimateIcon(false), 300); // match animation duration
  };

  const handleUserAccept = (index) => {
    const summaryPrefix = /^I’ve broken your request.*?\n\n/i;
    const stepNumber = finalizedSteps.length + 2;

    const step = messages[index]?.step;
    if (!step) return;

    triggerIconAnimation();

    // Execute the action using the __executeAction binding
    window.__executeAction(step)
      .then((result) => {
        if (result.success) {
          console.log("✅ Action executed successfully:", step);
        } else {
          console.error("❌ Error executing action:", step, result.error);
        }
      })
      .catch((error) => {
        console.error("❌ Error executing action:", step, error);
      });

    setMessages((prev) => {
      const updated = [...prev];
      const cleanContent = updated[index].content
        .replace(summaryPrefix, "") // 🧹 remove "I’ve broken..." line
        .replace(" Would you like to record this step?", ""); // 🧹 remove trailing question

      updated[index].content = cleanContent;
      updated[index].status = "accepted";
      return updated;
    });
    setFinalizedSteps((prev) => [...prev, step]);

    // Pop next step from queue
    if (pendingStepsQueue.length > 0) {
      const nextStep = pendingStepsQueue[0];
      const msg = {
        role: "assistant",
        content: generateAssistantMessage(nextStep, currentStepNumber),
        step: nextStep,
        status: "pending",
      };
      const newIndex = messages.length;
      setMessages((prev) => [...prev, msg]);
      setCurrentStepNumber((prev) => prev + 1);
      setPendingStep({ step: nextStep, index: newIndex });
      setPendingStepsQueue((prev) => prev.slice(1));
    } else {
      setPendingStep(null);
    }
  };

  const handleUserReject = (index) => {
    const summaryPrefix = /^I’ve broken your request.*?\n\n/i;
    const stepNumber = finalizedSteps.length + 2;
    triggerIconAnimation();
    setMessages((prev) => {
      const updated = [...prev];
      let cleanContent = updated[index].content
        .replace(summaryPrefix, "")
        .replace(" Would you like to record this step?", "");

      updated[index].content = cleanContent;
      updated[index].status = "rejected";
      return updated;
    });

    if (pendingStepsQueue.length > 0) {
      const nextStep = pendingStepsQueue[0];
      const msg = {
        role: "assistant",
        content: generateAssistantMessage(nextStep, currentStepNumber),
        step: nextStep,
        status: "pending",
      };
      const newIndex = messages.length;
      setMessages((prev) => [...prev, msg]);
      setCurrentStepNumber((prev) => prev + 1);
      setPendingStep({ step: nextStep, index: newIndex });
      setPendingStepsQueue((prev) => prev.slice(1));
    } else {
      setPendingStep(null);
    }
  };

  const handleUserSend = () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    sendToLLM(input);
    setInput("");
  };

  const handleConfirm = () => {
    console.log(finalizedSteps);
    // TO DO - ASK PLAYWRIGHT TO DO THE STEP AND RECORD THE STEP
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <div
      id="floating-tab-list-dock-justifyend"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>Record Test Step</strong>
        </div>
      </div>

      <div className="chat-body">
        {messages.map((msg, i) => {
          const isLastAssistantMessage =
            msg.role === "assistant" &&
            msg.content !== baseMessage &&
            pendingStep &&
            pendingStep.index === i;

          return (
            <div
              key={i}
              className={`chat-row ${msg.role === "user" ? "user" : ""}`}
            >
              <div
                className={`chat-message ${
                  msg.role === "user" ? "chat-user" : "chat-assistant"
                }`}
              >
                {msg.content}
              </div>

              {msg.role === "assistant" && (
                <div className="chat-actions">
                  {msg.status === "accepted" && (
                    <Check size={20} color="#2e7d32" title="Accepted" />
                  )}
                  {msg.status === "rejected" && (
                    <X size={20} color="#d32f2f" title="Rejected" />
                  )}
                  {msg.status === "pending" && isLastAssistantMessage && (
                    <>
                      <Check
                        className={`chat-icon-button ${
                          animateIcon ? "chat-icon-animate" : ""
                        }`}
                        size={20}
                        color="#2e7d32"
                        onClick={() => handleUserAccept(i)}
                        title="Confirm this step"
                      />
                      <X
                        className={`chat-icon-button ${
                          animateIcon ? "chat-icon-animate" : ""
                        }`}
                        size={20}
                        color="#d32f2f"
                        onClick={() => handleUserReject(i)}
                        title="Reject this step"
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="chat-row">
            <div className="chat-message chat-assistant">
              <em>
                Typing<span className="dots">...</span>
              </em>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
        {pendingStep && (
          <div className="chat-step-counter">
            <em>
              Showing Step {currentStepNumber} of {totalStepsFromLLM}
            </em>
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          className="cookie-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" &&
            !isTyping &&
            !pendingStep &&
            pendingStepsQueue.length === 0 &&
            handleUserSend()
          }
          placeholder="Describe the action to perform..."
          disabled={
            isTyping || pendingStep !== null || pendingStepsQueue.length > 0
          }
        />
        <div className="chat-send">
          <Send
            size={20}
            color="#24a0ed"
            onClick={() => {
              if (!isTyping && !pendingStep && pendingStepsQueue.length === 0) {
                handleUserSend();
              }
            }}
            style={{
              cursor:
                isTyping || pendingStep || pendingStepsQueue.length > 0
                  ? "not-allowed"
                  : "pointer",
            }}
          />
        </div>
      </div>

      <ConfirmCancelFooter
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        disabled={
          isTyping || pendingStep !== null || finalizedSteps.length === 0
        }
        confirmLabel="Confirm Step"
      />
    </div>
  );
}
