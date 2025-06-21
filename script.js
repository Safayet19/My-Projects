const drinksContainer = document.getElementById('drinks-container');
const groupList = document.getElementById('group-list');
const groupHeader = document.querySelector('.card-header');
let group = [];

//-----------------------------Loading the drinks from API----------------------------------------------
const loadAllDrinks = () => {
  const drinkPromises = Array.from({ length: 8 }, () => //karon 8 ta bolse
    fetch("https://www.thecocktaildb.com/api/json/v1/1/random.php")
      .then(res => res.json())
      .then(data => data.drinks[0])
  );

  Promise.all(drinkPromises).then(displayDrinks);
};

//-----------------------------Creating Drink Card------------------------------------------------
const createDrinkCard = (drink) => {
  const div = document.createElement('div');
  div.className = 'col-md-6 col-lg-4 mb-4';

  div.innerHTML = `
    <div class="card h-100">
      <img src="${drink.strDrinkThumb}" class="card-img-top" alt="${drink.strDrink}">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${drink.strDrink}</h5>
        <p class="card-text"> <strong> Category: </strong> ${drink.strCategory}</p>
        <p class="card-text"> ${drink.strInstructions.substring(0, 50)}...</p>
        <div class="mt-auto">
          <button class="btn btn-success mb-2 add-btn" data-id="${drink.idDrink}"> Add to group</button>
          <button class="btn btn-info details-btn">Details</button>
        </div>
      </div>
    </div>
  `;

  const addBtn = div.querySelector('.add-btn');
  const isAdded = group.some(d => d.idDrink == drink.idDrink);

  //j item ta nisi tar button change hoye jabe
  if (isAdded) {
    addBtn.disabled = true;
    addBtn.textContent = 'Drink is added to group';
    addBtn.classList.remove('btn-success');
    addBtn.classList.add('btn-secondary');
  }

  addBtn.onclick = () => {
    if (group.length >= 7) {
      alert('Cannot add more than 7 drinks to the group');
      return;
    }
    if (!group.some(d => d.idDrink === drink.idDrink)) {
      group.push(drink);
      updateGroup();
      addBtn.disabled = true;
      addBtn.textContent = 'Drink is added to group';
      addBtn.classList.remove('btn-success');
      addBtn.classList.add('btn-secondary');
    }
  };

  const detailsBtn = div.querySelector('.details-btn');
  detailsBtn.onclick = () => showDrinkDetails(drink.idDrink);

  return div;
};

//-----------------------------Display the drinks-----------------------------------------------
const displayDrinks = (drinkList) => {
  drinksContainer.innerHTML = '';

  if (!drinkList || drinkList.length == 0) {
    drinksContainer.innerHTML = '<p class="text-center fs-2 fw-bold text-danger">No drinks found !</p>';
    return;
  }

  const row = document.createElement('div');
  row.className = 'row';

  drinkList.forEach(drink => {
    row.append(createDrinkCard(drink));
  });

  drinksContainer.append(row);
};

//-----------------------------Updating Slected Items Group-----------------------------------------------
const updateGroup = () => {
  groupList.innerHTML = '';

  group.forEach((drink, index) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.textContent = drink.strDrink;

    const btn = document.createElement('button');
    btn.className = 'btn btn-sm btn-danger';
    btn.textContent = 'Remove';

    btn.onclick = () => {
      group.splice(index, 1);
      updateGroup();

      //Abar enable er jonno 
      const allAddButtons = document.querySelectorAll(`[data-id='${drink.idDrink}']`);

      allAddButtons.forEach(btn => {
        btn.disabled = false;
        btn.textContent = 'Add to group';
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-success');
      });
    };

    li.appendChild(btn);
    groupList.append(li);
  });

  groupHeader.textContent = `Group (${group.length}/7)`;
};

//-----------------------------Showing Details with Modals-----------------------------------------------
const showDrinkDetails = (id) => {
  fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`)
    .then(res => res.json())
    .then(data => {
      const drink = data.drinks[0];
      const ingredients = [];

      for (let i = 1; i <= 10; i++) {
        const ingr = drink[`strIngredient${i}`];
        const measure = drink[`strMeasure${i}`];
        if (ingr) 
          ingredients.push(`${measure || ''} ${ingr}`);
      }

      document.getElementById('modal-body').innerHTML = `
<img src="${drink.strDrinkThumb}" class="img-fluid mb-3 rounded mx-auto d-block" style="width: 300px;"">
        <p><strong> Name:</strong> ${drink.strDrink}</p>
        <p><strong> Category:</strong> ${drink.strCategory}</p>
        <p><strong> Alcoholic:</strong> ${drink.strAlcoholic}</p>
        <p><strong> Glass:</strong> ${drink.strGlass}</p>
        <p><strong> Instructions:</strong> ${drink.strInstructions}</p>
        <p><strong> Ingredients:</strong><br>${ingredients.join('<br>')}</p>
      `;

      new bootstrap.Modal(document.getElementById('detailsModal')).show();
    });
};

//-----------------------------Searching the drinks-----------------------------------------------
document.getElementById('search-form').onsubmit = (e) => {
  e.preventDefault();
  const term = document.getElementById('search-input').value.trim();
  if (!term) {
    loadAllDrinks();
    return;
  }

  fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(term)}`)
    .then(res => res.json())
    .then(data => displayDrinks(data.drinks));
};

loadAllDrinks(); //initially load er jonno
