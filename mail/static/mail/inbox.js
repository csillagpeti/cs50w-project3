document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);

  // Add listener to submit button
  document
    .querySelector("#compose-form")
    .addEventListener("submit", function () {
      let recipients = document.querySelector("#compose-recipients").value;
      let subject = document.querySelector("#compose-subject").value;
      let body = document.querySelector("#compose-body").value;

      send_email(recipients, subject, body);
    });

  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#maildetail-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
  document.querySelector("#compose-view h3").innerHTML = "New Mail";
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#maildetail-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  const emailsview = document.querySelector("#emails-view");

  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      console.log(emails);
      emails.forEach((email) => {
        const mailDiv = document.createElement("div");
        mailDiv.className = "mail";
        const emailLink = document.createElement("a");
        emailLink.href = `/emails/${email.id}`;
        emailLink.appendChild(mailDiv);
        emailLink.className = "emaillink text-decoration-none text-body";
        email.read
          ? (mailDiv.style.backgroundColor = "lightgrey")
          : (mailDiv.style.backgroundColor = "white");
        const mailcontent = document.createElement("div");
        mailcontent.className = "mailcontent";
        const fromListItem = document.createElement("span");
        fromListItem.className = "from";
        const subjectListItem = document.createElement("span");
        subjectListItem.className = "subject";
        const timeStampListItem = document.createElement("span");
        timeStampListItem.className = "timestamp";
        const archiveButton = document.createElement("button");
        archiveButton.className =
          "archive actionbutton btn btn-sm btn-outline-primary";
        fromListItem.innerHTML = email.sender;
        subjectListItem.innerHTML = email.subject;
        timeStampListItem.innerHTML = email.timestamp;

        //Archive button logic
        if (!email.archived) {
          archiveButton.innerHTML = "Archive";
        } else {
          archiveButton.innerHTML = "Unarchive";
        }
        archiveButton.setAttribute("data-email-id", email.id);
        archiveButton.setAttribute("data-email-archived", email.archived);
        archiveButton.addEventListener("click", function () {
          event.stopPropagation();
          event.preventDefault();
          const mailId = event.target.getAttribute("data-email-id");
          const isArchived = event.target.getAttribute("data-email-archived");
          archive(mailId, isArchived);
        });

        //Building the DOM
        mailcontent.appendChild(fromListItem);
        mailcontent.appendChild(subjectListItem);
        mailDiv.appendChild(mailcontent);
        mailDiv.appendChild(timeStampListItem);
        if (mailbox != "sent") {
          mailDiv.appendChild(archiveButton);
        }
        emailsview.appendChild(emailLink);
        emailLink.addEventListener("click", function (event) {
          event.preventDefault();
          load_maildetail(email.id);
        });
      });
    });
}

function send_email(recipients, subject, body) {
  //alert(recipients);
  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log(result);
    });
}

function cleanup() {
  mails = document.querySelectorAll(".mail");
  mails.forEach((mail) => {
    mail.remove();
  });

  maildetail = document.querySelectorAll(".maildetail");
  maildetail.forEach((maildetail) => {
    maildetail.remove();
  });

  maildetailbody = document.querySelectorAll(".maildetailbody");
  maildetailbody.forEach((maildetailbody) => {
    maildetailbody.remove();
  });

  mailseparator = document.querySelectorAll(".mailseparator");
  mailseparator.forEach((mailseparator) => {
    mailseparator.remove();
  });
}

function load_maildetail(mailId) {
  fetch(`emails/${mailId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      read: true,
    }),
  });

  cleanup();
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#maildetail-view").style.display = "block";

  mailDetailContainer = document.querySelector("#maildetail-view");
  maildetailDiv = document.createElement("div");
  maildetailDiv.className = "maildetail";

  mailbodyDiv = document.createElement("div");
  mailbodyDiv.className = "maildetailbody";

  fetch(`/emails/${mailId}`)
    .then((response) => response.json())
    .then((email) => {
      console.log(email);

      // Create DOM elements
      const fromListItem = document.createElement("li");
      const recipientsListItem = document.createElement("li");
      const subjectListItem = document.createElement("li");
      const timeStampListItem = document.createElement("li");
      const replyButton = document.createElement("button");
      replyButton.className = "actionbutton btn btn-sm btn-outline-primary";
      const hrtag = document.createElement("hr");
      hrtag.className = "mailseparator";
      const bodyListItem = document.createElement("li");

      // Parse values
      fromListItem.innerHTML = `<b>From:</b> ${email.sender}`;
      recipientsListItem.innerHTML = `<b>To: </b>${email.recipients}`;
      subjectListItem.innerHTML = `<b>Subject: </b>${email.subject}`;
      replyButton.innerHTML = `Reply`;
      timeStampListItem.innerHTML = `<b>Timestamp:</b>${email.timestamp}`;
      bodyListItem.innerHTML = email.body;

      //Append to DOM elements
      maildetailDiv.appendChild(fromListItem);
      maildetailDiv.appendChild(recipientsListItem);
      maildetailDiv.appendChild(subjectListItem);
      maildetailDiv.appendChild(timeStampListItem);
      maildetailDiv.appendChild(replyButton);
      mailbodyDiv.appendChild(bodyListItem);
      mailDetailContainer.appendChild(maildetailDiv);
      mailDetailContainer.appendChild(hrtag);
      mailDetailContainer.appendChild(mailbodyDiv);

      //Add reply functionality
      replyButton.addEventListener("click", function () {
        compose_reply(email);
      });
    });
}

function archive(mailId, isArchived) {
  let archiveNext = false;
  if (isArchived === "false") {
    archiveNext = true;
  }
  fetch(`/emails/${mailId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      archived: archiveNext,
    }),
  }).then(() => {
    load_mailbox("inbox");
  });
}

function compose_reply(email) {
  const currentUserEmail = document.querySelector(".container h2").innerHTML;

  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#maildetail-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  let replyRecipients = email.recipients.filter(
    (recipient) => recipient !== currentUserEmail
  );

  if (
    email.sender !== currentUserEmail &&
    !replyRecipients.includes(email.sender)
  ) {
    replyRecipients.push(email.sender);
  }

  // Set composition fields with actual email data
  document.querySelector("#compose-recipients").value =
    replyRecipients.join(", ");
  const isReplyAlready = email.subject.slice(0, 3) === "Re:";
  if (!isReplyAlready) {
    document.querySelector("#compose-subject").value = `Re: ${email.subject}`;
  } else {
    document.querySelector("#compose-subject").value = `${email.subject}`;
  }

  document.querySelector(
    "#compose-body"
  ).value = `\n\n---\nOn ${email.timestamp}, ${email.sender} wrote:\n${email.body}`;
  document.querySelector("#compose-view h3").innerHTML = "Reply Mail";
}
