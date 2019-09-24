jQuery = window.jQuery;

function preload(selector, fnc) {
  let values;
  try {
  values = document.querySelector(selector);
  values = [...values.querySelectorAll('option')];
  values = values.map(op => op.value);
  } catch(e) {
  console.info('error in parsing values', e)
  };
  return fnc?fnc(values):values;
}

window.load = (ev) => {
  window.formSubmit = jQuery._data(jQuery('form.car-compatibility-form').get(0), "events").submit[0].handler;
  ev.preventDefault && ev.preventDefault();
  new Vue({
    el: '.car-compatibility-form',
    template: template(),
    data: () => ({
      makes: preload('.selectBrand', r => r.splice(1)) || ['FSO'],
      brand: null,
      country: null, countries: preload('.countrySelect', r => r.splice(1)) || ['AU', 'PL'],
      model: undefined, models: [],
      year: null, years: [],
      fuel: null, fuels: [],
    }),
    mounted() {
      jQuery(document).off( 'change', 'select.selectBrand');
      jQuery(document).off( 'change', 'select.selectModel');
      jQuery(document).off( 'change', 'select.madeYear');
      // jQuery('select.selectBrand').removeClass('selectBrand');
      // jQuery('select.selectModel').removeClass('selectModel');
      // jQuery('select.madeYear').removeClass('madeYear');
      jQuery('form.car-compatibility-form').on('submit', this.carCheck);
    },
    watch: {
      brand(val) {
        if (val) {
          this.getModels(0);
          // jQuery('.loading').fadeOut();
        } else {
          // jQuery('.loading').fadeIn();
        }
      },
      model(val) {
        if (val) {
          jQuery('select.madeYear').removeAttr('disabled');
          this.getModels(1);
        } else {
          jQuery('select.carFuel').attr('disabled', 'disabled');
          jQuery('select.countrySelect').attr('disabled', 'disabled').val('');  
        }
      },
      year(val) {
        if (val) {
          this.getModels(2);
          jQuery('select.madeYear').removeAttr('disabled');
        } else {
          jQuery('select.carFuel').attr('disabled', 'disabled');
          jQuery('select.countrySelect').attr('disabled', 'disabled').val('');  
        }
      },
    },
    methods: {
      getModels(step = 0) {
        jQuery('.loading').fadeIn();
        const steps = 'select.selectModel,select.madeYear,select.carFuel'.split(',')
        jQuery(steps.slice(step)).attr('disabled', 'disabled');
        jQuery('select.countrySelect').attr('disabled', 'disabled').val('');
        jQuery.ajax({
          method: "POST",
          url: `${api||'/wp-admin/admin-ajax.php'}`,
          dataType: 'json',
          data: {
            action: ['getModel', 'getYear', 'getFuel'][step],
            brand: this.brand,
            model: this.model,
            year: this.year,
            fuel: this.fuel,
          },
          success: resp => {
            const array = resp.push ? resp : JSON.parse(resp)
            this[['models', 'years', 'fuels'][step]] = array;
            jQuery('.loading').fadeOut();
            jQuery(steps[step] || 'select.selectModel').removeAttr('disabled');
          },
        })
      },
      carCheck() {
        window.formSubmit()
      },
    }, // methods
  });
  return false;
}

function extend() {
  const src = 'https://unpkg.com/vue@2.6.10/dist/vue.js';
  let script = document.createElement('script');
  script.setAttribute('src', src);
  script.onload = () => {}
  document.head.appendChild(script);

  const link = document.createElement('a');
  link.onclick = load;
  link.href = '#';
  link.textContent = "Click here to use community based car-checker."
  document.querySelector('.car-compatibility-form').appendChild(link);
}

document.readyState === "complete"?extend():
document.addEventListener('DOMContentLoaded', extend);

function template() {
  return `
  <form class="hs-form comp-sliding-form car-compatibility-form" autocomplete="on" method="post">
    <div class="form-box">
      <legend class="hs-field-desc" style="display:block;">What brand is your car?</legend>
      <select name="carBrand" tabindex="1" class="hs-input selectBrand" required="" v-model="brand">
        <option value="" disabled="disabled" selected="">- Please Select -</option>
        <option v-for="make in makes" :value="make">{{make}}</option>
      </select>
      <label class="err-msg">Please select an option from the dropdown.</label>
    </div>
    
    <div class="form-box">
      <legend class="hs-field-desc" style="display:block;">Which model it is?</legend>
      <select v-model="model" class="hs-input selectModel" tabindex="2" name="carModel" disabled="" required="">
        <option value="" disabled="disabled" selected="">- Please Select -</option>
        <option v-for="model in models" :value="model">{{model}}</option>
      </select>
      <label class="err-msg">Please select an option from the dropdown.</label>
    </div>
    
    <div class="form-box hs-input customModel">
      <input class="hs-input" type="text" name="carCustomModel" placeholder="Please enter your model">
      <label class="err-msg">Please enter your model name</label>
    </div>
    
    <div class="form-box">
      <legend class="hs-field-desc" style="display:block;">What year was it made?</legend>
      <select v-model="year" class="hs-input madeYear" tabindex="3" name="carYear" disabled="" required="">
        <option value="" disabled="disabled" selected="">- Please Select -</option>
        <option v-for="year in years" :value="year">{{year}}</option>
      </select>
      <label class="err-msg">Please select an option from the dropdown.</label>
    </div>
    
    <div class="form-box">
      <legend class="hs-field-desc" style="display:block;">What fuel does it use?</legend>
      <select v-model="fuel" class="hs-input carFuel" tabindex="4" name="carFuel" disabled="" required="">
        <option value="" disabled="disabled" selected="">- Please Select -</option>
        <option v-for="fuel in fuels" :value="fuel">{{fuel}}</option>
      </select>
      <label class="err-msg">Please select an option from the dropdown.</label>
    </div>
    
    <div class="form-box">
      <legend class="hs-field-desc" style="display:block;">In what country is your car driven?</legend>
      <select v-model="country" class="hs-input countrySelect" tabindex="5" disabled="" name="country" required="" value="">
        <option value="" disabled="disabled" selected="">- Please Select -</option>
        <option v-for="country in countries" :value="country">{{country}}</option>
      </select>
      <label class="err-msg">Please select an option from the dropdown.</label>
    </div>
    
    <div class="form-box">
      <legend class="hs-field-desc" style="display:block;">What is your first name?</legend>
      <input class="hs-input" type="text" name="fname" tabindex="6" id="fname" autocomplete="fname" placeholder="Enter your first name">
      <label class="err-msg">Please enter your name</label>
    </div>
    
    <div class="form-box">
      <legend class="hs-field-desc" style="display:block;">What is your email address?</legend>
      <input class="hs-input" type="email" id="email" tabindex="7" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$" name="email" autocomplete="email" placeholder="Enter your email">
      <label class="err-msg">Please enter valid email address</label>
    </div>
    
    <div style="text-align:center;">
      <input type="hidden" name="req-version" value="2">
      <button type="submit" class="hs-button submitForm primary large" id="check-car-bottom" disabled="">Check Compatibility Now!</button>
    </div>
  </form>
`;}