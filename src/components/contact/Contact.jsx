import React, { useState } from "react";
import "./contact.css";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState({
    type: "idle",
    msg: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name || !form.email || !form.subject || !form.message) {
      setStatus({ type: "error", msg: "Please fill in all fields." });
      return;
    }

    setStatus({ type: "loading", msg: "" });

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Request failed");

      setStatus({ type: "success", msg: "Message sent successfully!" });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus({ type: "error", msg: "Failed to send. Try again." });
    }
  }

  return (
    <section className="contact container section" id="contact">
      <h2 className="section__title">Get In Touch</h2>

      <div className="contact__container grid">
        <div className="contact__info">
          <h3 className="contact__title">Let's talk about everything!</h3>
          <p className="contact__details">
            Don't like forms? Send me an email. 👋
          </p>
        </div>

        <form className="contact__form" onSubmit={handleSubmit}>
          <div className="contact__form-group">
            <div className="contact__form-div">
              <input
                type="text"
                name="name"
                className="contact__form-input"
                placeholder="Insert your name"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="contact__form-div">
              <input
                type="email"
                name="email"
                className="contact__form-input"
                placeholder="Insert your email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="contact__form-div">
            <input
              type="text"
              name="subject"
              className="contact__form-input"
              placeholder="Insert your subject"
              value={form.subject}
              onChange={handleChange}
            />
          </div>

          <div className="contact__form-div contact__form-area">
            <textarea
              name="message"
              cols="30"
              rows="10"
              className="contact__form-input"
              placeholder="Write your message"
              value={form.message}
              onChange={handleChange}
            ></textarea>
          </div>

          <button className="btn" type="submit" disabled={status.type === "loading"}>
            {status.type === "loading" ? "Sending..." : "Send Message"}
          </button>

          {status.type === "success" && (
            <p className="contact__status contact__status--success">{status.msg}</p>
          )}

          {status.type === "error" && (
            <p className="contact__status contact__status--error">{status.msg}</p>
          )}
        </form>
      </div>
    </section>
  );
};

export default Contact;
