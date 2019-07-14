var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, desc, val) {
            var newItem, ID;

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on type
            if (type === 'exp') {
                newItem = new Expense(ID, desc, val);
            } else if (type ==='inc') {
                newItem = new Income(ID, desc, val);
            }
            
            // Push into data structure
            data.allItems[type].push(newItem);

            return newItem;
        },
        deleteItem: function(type, id) {
            var ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function() {

            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget (income - expenses)
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of income that is spent
            if (data.totals.inc > data.totals.exp) {
                data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
            } else {
                data.percentage = -1; // Non existent 
            }
        },
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function() {
            if (data.totals.inc > data.totals.exp) {
                var allPercentages = data.allItems.exp.map(function(current) {
                    return current.getPercentage();
                });
                return allPercentages;
            } else {
                return -1;
            }
        },
        getBudget: function() {

            // Returns the data in an object
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpense: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function() {
            console.log(data);
        }
    };

})();

var UIController = (function() {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, decimal;

        num = Math.abs(num);
        num = num.toFixed(2); // 2 decimal points
        numSplit = num.split('.');
        int = numSplit[0];

        if (int.length > 3) {
            numberOfCommas = Math.floor((int.length -1) / 3);
        
            for (var i = 0; i < numberOfCommas; i++) { 
                var position = 3 + 3*i +i;
                int = int.slice(0, -position) + ',' + int.slice(-position);     }
        }
        decimal = numSplit[1];

        return (type === 'exp' ? '- ' : '+ ') + int + '.' + decimal;
    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        addListItem: function(obj, type) {
            // Create html string with placeholder text
                var html, newHtml, element;

                if (type === 'inc') {
                    element = DOMstrings.incomeContainer;

                    html = `<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix">
                    <div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn">
                    <i class="ion-ios-close-outline"></i></button></div></div></div>`;
                } else if (type === 'exp') {
                    element = DOMstrings.expenseContainer;

                    html = `<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix">
                    <div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn">
                    <i class="ion-ios-close-outline"></i></button></div></div></div>`;
                }

            // Replace the placeholder text with data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },
        deleteListItem: function(elementId) {
            var element = document.getElementById(elementId);
            element.parentNode.removeChild(element);
        },
        clearFields: function() {
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArray[0].focus();
            
        },
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type === 'inc' : type === 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExpense, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensePercentageLabel);

            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';

                }
            });
        },
        displayDate: function() {
            var now, months, month, year;
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = months[now.getMonth()];
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = month + ' ' + year;
        },
        changeType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ', ' + 
                DOMstrings.inputDescription + ', ' + 
                DOMstrings.inputValue);
                
            nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        getDOMstrings: function() {
            return DOMstrings;
        }
    };
    
})();

var appController = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        var DOMstrings = UICtrl.getDOMstrings();

        document.querySelector(DOMstrings.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOMstrings.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOMstrings.inputType).addEventListener('change', UICtrl.changeType);
    };

    var updateBudget = function() {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {

        // Calculate percentages
        budgetCtrl.calculatePercentages();

        // Read them from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // Update UI
        UICtrl.displayPercentages(percentages);

    };

    var ctrlAddItem = function() {
        var input, newItem;

        // 1. Get the input field data
        input = UICtrl.getInput();
        console.log(input);

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. Add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the new item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();

        }
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, id;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);
        }

        // Delete item from data structure
        budgetCtrl.deleteItem(type, id);

        // Delete the item from the UI
        UICtrl.deleteListItem(itemID);

        // Update and show new budget
        updateBudget();

        updatePercentages(percentages);
    };

    return {
        init: function() {
            console.log('Application has started');
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpense: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };


})(budgetController, UIController);

appController.init();