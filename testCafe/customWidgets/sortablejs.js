import {frameworks, url, setOptions, initSurvey, addExternalDependencies, getSurveyResult} from "../settings";
import {Selector, ClientFunction} from 'testcafe';
const assert = require('assert');
const title = `sortablejs`;

const json = { questions: [
    { type: "checkbox", name: "lifepriopity", renderAs: "sortablejs", title: "Life Priorities ", isRequired: true, colCount: 0,
        choices: ["family", "work", "pets", "travels", "games"] }
]};

const getWidgetConfig = function(framework) {
    var widget;

    if (framework !== 'vue') {
        widget = {
            name: "sortablejs",
            isFit : function(question) { return question["renderAs"] === 'sortablejs'; },
            htmlTemplate: `
              <div style="width:50%">
                <div class="result" style="border-style:solid;border-width:1px;border-color:#1ab394;width:100%; min-height:50px;">
                  <span>move items here</span>
                </div>
                <div class="source" style="border-style:solid;border-width:1px;border-color:#1ab394;width:100%; min-height:50px; margin-top:10px;">
                  <!-- ko foreach: { data: question.visibleChoices, as: 'item' } -->
                    <div data-bind="attr: { 'data-value':item.value }">
                      <div style="background-color:#1ab394;color:#fff;margin:5px;padding:10px;" data-bind="text:item.text"></div>
                    </div>
                  <!-- /ko -->
                </div>
              </div>
            `,
            afterRender: function(question, el) {
                var resultContainer = el.querySelector(".result");
                var emptyText = resultContainer.querySelector("span");
                var sourceContainer = el.querySelector(".source");
                Sortable.create(resultContainer, {
                    animation: 150,
                    group: {
                        name: 'top3',
                        pull: true,
                        put: true
                    },
                    onSort: function (evt) {
                        var result = [];
                        if (evt.to.children.length === 1) {
                            emptyText.style.display = "inline-block";
                        } else {
                            emptyText.style.display = "none";
                            for (var i = 1; i < evt.to.children.length; i++) {
                                result.push(evt.to.children[i].dataset.value)
                            }
                        }
                        question.value = result;
                    },
                });
                Sortable.create(sourceContainer, {
                    animation: 150,
                    group: {
                        name: 'top3',
                        pull: true,
                        put: true
                    }
                });
            }
        }
    } else {
        widget = {
            name: "sortablejs",
            isFit : function(question) { return question["renderAs"] === 'sortablejs'; }
        }

        Vue.component(widget.name, {
            props: ['question', 'css', 'isEditMode'],
            template:`
              <div style="width:50%">
                <div class="result" style="border-style:solid;border-width:1px;border-color:#1ab394;width:100%; min-height:50px;">
                  <span>move items here</span>
                </div>
                <div class="source" style="border-style:solid;border-width:1px;border-color:#1ab394;width:100%; min-height:50px; margin-top:10px;">
                  <div v-for="(item, index) in question.visibleChoices" :data-value="item.value">
                    <div style="background-color:#1ab394;color:#fff;margin:5px;padding:10px;">{{ item.text}}</div>
                  </div>
                </div>
              </div>
            `,
            mounted: function () {
                var vm = this;
                var resultContainer = vm.$el.querySelector("div:first-child");
                var emptyText = resultContainer.querySelector("span");
                var sourceContainer = vm.$el.querySelector("div:last-child");
                Sortable.create(resultContainer, {
                    animation: 150,
                    group: {
                        name: 'top3',
                        pull: true,
                        put: true
                    },
                    onSort: function (evt) {
                        var result = [];
                        if (evt.to.children.length === 1) {
                            emptyText.style.display = "inline-block";
                        } else {
                            emptyText.style.display = "none";
                            for (var i = 1; i < evt.to.children.length; i++) {
                                result.push(evt.to.children[i].dataset.value)
                            }
                        }
                        vm.question.value = result;
                    },
                });
                Sortable.create(sourceContainer, {
                    animation: 150,
                    group: {
                        name: 'top3',
                        pull: true,
                        put: true
                    }
                });
            }
        })
    }

    return {
        widget: widget,
        questionType: 'checkbox',
        renderAs: 'sortablejs'
    }
};

frameworks.forEach( (framework) => {
    fixture `${framework} ${title}`

        .page `${url}${framework}/customWidget.html`

        .beforeEach( async ctx => {
            await initSurvey(framework, json, "bootstrap", getWidgetConfig);
        });

    test(`check integrity`, async t => {
        await t
            .hover(`.source div:nth-child(1) div`)
            .hover(`.source div:nth-child(2) div`)
            .hover(`.source div:nth-child(3) div`)
            .hover(`.source div:nth-child(4) div`)
            .hover(`.source div:nth-child(5) div`)
    })

    test(`choose empty`, async t => {
        const getPosition = ClientFunction(() =>
            document.documentElement.innerHTML.indexOf('Please answer the question'));
        let position;
        let surveyResult;

        await t
            .click(`input[value=Complete]`);

        position = await getPosition();
        assert.notEqual(position, -1);

        surveyResult = await getSurveyResult();
        assert.equal(typeof surveyResult, `undefined`);
    });

    test(`choose value`, async t => {
        // TODO d&d doesn't work https://github.com/DevExpress/testcafe/issues/897
        // let surveyResult;
        //
        // await t
        //     .dragToElement('.source div:nth-child(4)', '.result')
        //     .dragToElement('.source div:nth-child(1)', '.result')
        //     .click(`input[value=Complete]`);
        //
        // surveyResult = await getSurveyResult();
        // assert.deepEqual(surveyResult.lifepriopity, ["travels","family"]);
    });

    test(`change priority`, async t => {
        // TODO d&d doesn't work https://github.com/DevExpress/testcafe/issues/897
        // let surveyResult;
        //
        // await t
        //     .dragToElement('.source div:nth-child(1)', '.result')
        //     .dragToElement('.source div:nth-child(2)', '.result')
        //     .dragToElement('.source div:nth-child(3)', '.result')
        //     .dragToElement('.source div:nth-child(4)', '.result')
        //     .dragToElement('.source div:nth-child(5)', '.result')
        //     .dragToElement('.result div:nth-child(1)', '.result div:nth-child(5) div')
        //     .dragToElement('.result div:nth-child(1)', '.result div:nth-child(4) div')
        //     .dragToElement('.result div:nth-child(1)', '.result div:nth-child(3) div')
        //     .dragToElement('.result div:nth-child(1)', '.result div:nth-child(2) div')
        //
        //     .click(`input[value=Complete]`);
        //
        // surveyResult = await getSurveyResult();
        // assert.deepEqual(surveyResult.lifepriopity, ["games","travels","pets","work","family"]);
    });
});