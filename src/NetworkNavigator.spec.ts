import "../base/testSetup";

import { expect } from "chai";
import { NetworkNavigator, INetworkNavigatorData, INetworkNavigatorNode } from "./NetworkNavigator";
import * as $ from "jquery";

describe("NetworkNavigator", () => {
    let parentEle: JQuery;
    beforeEach(() => {
        parentEle = $("<div></div>");
    });

    afterEach(() => {
        if (parentEle) {
            parentEle.remove();
        }
        parentEle = undefined;
    });

    const createInstance = () => {
        let ele = $("<div>");
        parentEle.append(ele);
        let result = {
            instance: new NetworkNavigator(ele),
            element: ele,
        };
        result.instance.configuration = {
            animate: false
        };
        return result;
    };

    it("should load", () => {
        createInstance();
    });

    const oneSourceTwoTargets: INetworkNavigatorData<INetworkNavigatorNode> = {
        nodes: [
            {  selected: false, name: "SOURCE_NODE" },
            {  selected: false, name: "TARGET_NODE_1" },
            {  selected: false, name: "TARGET_NODE_2" },
        ],
        links: [{
            source: 0,
            target: 1,
        }, {
            source: 0,
            target: 2,
        }, ],
    };

    describe("filterNodes", () => {
        const testFilters = (instance: NetworkNavigator, element: JQuery, text: string, matches: string[]) => {
            // Set the filter to highlight nodes with "TARGET" in their name
            instance.filterNodes(text, false);

            // The 3 nodes
            let nodes = element.find(".node");
            expect(nodes.length).to.eq(3);

            let highlightedNodes = nodes.filter((i, node) => {
                let trans = $(node).find("circle").attr("transform");

                // TODO: Better check
                return trans && trans.indexOf("scale(3)") >= 0;
            });

            let texts: string[] = [];
            highlightedNodes.each((i, node) => {
                let textNode = $(node).find("text")[0];
                texts.push(textNode.innerText || textNode.textContent);
            });
            expect(texts).to.deep.equal(matches);
        };

        it("should visibly change nodes when they match a search string", () => {
            let { instance, element } = createInstance();

            // Set that datas
            instance.setData(oneSourceTwoTargets);

            testFilters(instance, element, "TARGET", ["TARGET_NODE_1", "TARGET_NODE_2"]);
        });

        it("should visibly change nodes when the search string has changed", () => {
            let { instance, element } = createInstance();

            // Set that datas
            instance.setData(oneSourceTwoTargets);

            // Set the first
            testFilters(instance, element, "TARGET", ["TARGET_NODE_1", "TARGET_NODE_2"]);

            // Set the second
            testFilters(instance, element, "SOURCE", ["SOURCE_NODE"]);
        });

        it("should visibly change nodes when the search string has changed back to nothing", () => {
            let { instance, element } = createInstance();

            // Set that datas
            instance.setData(oneSourceTwoTargets);

            // Set the first
            testFilters(instance, element, "TARGET", ["TARGET_NODE_1", "TARGET_NODE_2"]);

            // Set the second
            testFilters(instance, element, "", []);
        });
    });

    describe("selection", () => {
       it("should raise a click event when a node is selected", (done) => {
            let { instance } = createInstance();

            // Set that datas
            instance.setData(oneSourceTwoTargets);

            let clicked = false;
            instance.events.on("nodeClicked", (node: INetworkNavigatorNode) => {
                clicked = true;
                done();
            });

            instance.onNodeClicked(<any>{});
       });
    });

    describe("graph", () => {
        it("should show 3 nodes, when there is a source and two targets", () => {
            let { instance, element } = createInstance();

            // Set that datas
            instance.setData(oneSourceTwoTargets);

            // The 3 nodes
            expect(element.find("circle").length).to.eq(3);
        });

        it("should show two connections, when there is a source and two targets", () => {
            let { instance, element } = createInstance();

            // Set that datas
            instance.setData(oneSourceTwoTargets);

            // The 2 links
            expect(element.find(".link").length).to.eq(2);
        });
    });
});
