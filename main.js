const BASE_URL = "https://demo.tesserapass.es/api";
const COMPANY_NAME = "de-ruta-con-miguel";
const EVENT_ID = 5;

let data = null;

const loadEvent = async () => {
  const response = await fetch(`${BASE_URL}/company/${COMPANY_NAME}/events/${EVENT_ID}`);
  data = await response.json();
  console.log(data);
  updateDom(data.company, data.event);
}

const updateHeader = (company, event) => {
  const headerTitle = document.querySelector('.header__title');
  headerTitle.textContent = event.name;
  const headerSubtitle = document.querySelector('.header__subtitle');
  headerSubtitle.textContent = company.name;
  const headerDescription = document.querySelector('.header__description');
  headerDescription.textContent = event.description;

  const headerImage = document.querySelector(".header__image");
  headerImage.setAttribute("src", event.image);
  headerImage.setAttribute("alt", "Moto en un prado en medio del campo");
}

const updateEventCards = (event) => {
  const eventCardLocation = document.querySelector(".event__card--location .event__card__description");
  eventCardLocation.textContent = event.address;

  const eventCardDate = document.querySelector(".event__card--date .event__card__description");
  const startAt = new Date(event.start_at);
  const endsAt = new Date(event.ends_at);
  const startAtString = startAt.toLocaleDateString('es-es', { year: "numeric", month: "long", day: "numeric" });
  const openHourString = startAt.toLocaleTimeString("es-es", { hour: "2-digit", minute: "2-digit", hour12: false })
  const closeHourString = endsAt.toLocaleTimeString("es-es", { hour: "2-digit", minute: "2-digit", hour12: false })

  if (startAt.getDay() !== endsAt.getDay()) {
    eventCardDate.textContent = `${startAtString.replaceAll("de", "")} - ${openHourString} - Cierre`;
  } else {
    eventCardDate.textContent = `${startAtString.replaceAll("de", "")} - ${openHourString} - ${closeHourString}`;
  }
}

const updateForm = (event) => {
  const selectInput = document.querySelector(".form__input--select-tickets");
  console.log(selectInput, event.max_tickets_for_order);

  for (let index = 1; index <= event.max_tickets_for_order; index++) {
    const optionElement = document.createElement("option");
    optionElement.setAttribute("value", index);
    optionElement.textContent = index;
    selectInput.appendChild(optionElement);
  }
}

const handleFormValidation = (event) => {
  const emailInput = document.querySelector(".form__input--email");
  const confirmEmailInput = event.target.value

  if (emailInput.value !== confirmEmailInput) {
    document.querySelector(".form__input--email").parentElement.classList.add("form__input--error");
    document.querySelector(".form__input--confirmation").parentElement.classList.add("form__input--error");
  }
}

const updateDom = (company, event) => {
  updateHeader(company, event);
  updateEventCards(event);
  updateForm(event);
}

const formSubmit = async (event) => {
  event.preventDefault();
  const fields = {};

  const inputs = document.querySelectorAll(".form__input");

  inputs.forEach(input => {
    fields[input.getAttribute('name')] = input.value;
  })

  if (fields.email !== fields.confirm_email) {
    alert("TE HAS EQUIVOCADO CON LOS CORREOS ELECTRÓNICOS");
  }

  const response = await fetch(`${BASE_URL}/company/${COMPANY_NAME}/events/${EVENT_ID}/orders`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      order: {
        full_name: fields.fullname,
        email: fields.email,
        rrpp: "",
        total_price: data.event.products[0].price * fields.number_of_tickets,
        confirmed_email: fields.confirm_email,
      },
      tickets: Array.from(fields.number_of_tickets, ticket => ({
        product_id: data.event.products[0].id,
        full_name: fields.fullname,
        email: fields.email,
      }))
    })
  });

  const responseData = await response.json();

  if (responseData.checkout.payment_intent === "FREE_EVENT") {
    const confirmationSection = document.querySelector(".confirmation");
    confirmationSection.classList.remove("confirmation--hidden")

    const emailText = document.createElement("p");
    emailText.textContent = `Te hemos enviado un correo electrónico a ${fields.email} con las entradas`;
    confirmationSection.appendChild(emailText);
  }
}

loadEvent();

const form = document.querySelector('.form');
form.addEventListener('submit', formSubmit);

const emailConfirmationInput = document.querySelector(".form__input--confirmation");
emailConfirmationInput.addEventListener('blur', handleFormValidation)
