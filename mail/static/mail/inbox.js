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
        console.log(email.body);
        const mailDiv = document.createElement("div");
        mailDiv.className = "mail";
        const emailLink = document.createElement("a");
        emailLink.href = `/emails/${email.id}`
        emailLink.appendChild(mailDiv)
        email.read ? mailDiv.style.backgroundColor = 'lightgrey' : mailDiv.style.backgroundColor = 'white';
        const fromListItem = document.createElement("li");
        const subjectListItem = document.createElement("li");
        const timeStampListItem = document.createElement("li");
        fromListItem.innerHTML = email.sender;
        subjectListItem.innerHTML = email.subject;
        timeStampListItem.innerHTML = email.timestamp;
        mailDiv.appendChild(fromListItem);
        mailDiv.appendChild(subjectListItem);
        mailDiv.appendChild(timeStampListItem);
        emailsview.appendChild(emailLink);
        emailLink.addEventListener('click', function(event) {
          event.preventDefault();
          load_maildetail(email.id);
        })
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

function cleanup(){
  mails = document.querySelectorAll(".mail");
  mails.forEach(mail => {
    mail.remove()
  })
}

function load_maildetail(mailId){
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#maildetail-view").style.display = "block";

  fetch(`/emails/${mailId}`)
.then((response) => response.json())
.then(email => {
  console.log(email);
})
}