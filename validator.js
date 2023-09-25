// Viết mã JS tại đây

//Đối tượng Validator
function Validator(options) {
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.match(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  var selectorRules = {};
  //hàm thực hiện validate
  function validate(inputElement, rule) {
    var errorElement = getParent(
      inputElement,
      option.formGroupSelector
    ).querySelector(options.errorSelector);

    var errorMsg = rule.test(inputElement.value);
    //lấy ra các rules của selector
    var rules = selectorRules[rule.selector];

    //lặp qua từng rule + kiểm tra
    //nếu có lỗi thì dừng việc kiểm tra
    for (var i = 0; i < rules.length; i++) {
      switch (inputElement.type) {
        case "radio":
        case "checkbox":
          errorMsg = rules[i](inputElement.value);

          break;
        default:
          errorMsg = rules[i](inputElement.value);
      }
      if (errorMsg) break;
    }
    if (errorMsg) {
      errorElement.innerText = errorMsg;
      getParent(inputElement, option.formGroupSelector).classList.add(
        "invalid"
      );
    } else {
      errorElement.innerText = "";
      getParent(inputElement, option.formGroupSelector).classList.remove(
        "invalid"
      );
    }

    return !errorMsg;
  }

  //lấy element form cần validate
  var formElement = document.querySelector(options.form);
  if (formElement) {
    //khi submit form
    formElement.onsubmit = function (e) {
      e.preventDefault();
      var isFormValid = true;
      //lặp qua từng rules và validate
      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);
        var isValid = validate(inputElement, rule);
        if (!isValid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        if (typeof options.onSubmit === "function") {
          var enableInputs = formElement.querySelectorAll(
            "[name]:not([disabled])"
          );

          var formValues = Array.from(enableInputs).reduce(function (
            values,
            input
          ) {
            values[input.name] = input.value;
            return values;
          },
          {});
          options.onSubmit(formValues);
        }
      }
    };

    //xử lí lặp qua mỗi rue và xử lí (nghe event blur,input..)
    options.rules.forEach(function (rule) {
      //lưu lại các rules cho mỗi input
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      var inputElement = formElement.querySelector(rule.selector);
      if (inputElement) {
        //xử lí blur khỏi input
        inputElement.onblur = function () {
          validate(inputElement, rule);
        };
        //xử lí mỗi khi người dùng nhập login
        inputElement.oninput = function () {
          var errorElement = getParent(
            inputElement,
            option.formGroupSelector
          ).querySelector(".form-message");
          errorElement.innerText = "";
          getParent(inputElement, option.formGroupSelector).classList.remove(
            "invalid"
          );
        };
      }
    });
  }
}

//định nghĩa rules
//nguyên tắc của rules
//1.Khi có lỗi => trả ra msg lỗi
//2.khi hợp lệ -> ko trả ra j cả
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.trim() ? undefined : message || "vui lòng nhập trường này";
    },
  };
};

Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      var regex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
      return regex.test(value)
        ? undefined
        : message || "Trường này phải là email";
    },
  };
};

Validator.minLength = function (selector, min) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= min
        ? undefined
        : `Vui lòng nhập tối thiểu ${min} kí tự`;
    },
  };
};

Validator.isConfirmed = function (selector, getConfirmValue, message) {
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirmValue()
        ? undefined
        : message || "giá trị nhập vào không chính xác";
    },
  };
};
