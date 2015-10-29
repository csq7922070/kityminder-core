define(function(require, exports, module) {
    var kity = require('../core/kity');
    var utils = require('../core/utils');

    var Minder = require('../core/minder');
    var MinderNode = require('../core/node');
    var Command = require('../core/command');
    var Module = require('../core/module');
    var Renderer = require('../core/render');

    Module.register('CornerMarkModule', function() {
        var minder = this;

        // Designed by Akikonata
        // [MASK, BACK]
        var CORNER_MARK_COLORS = [null, ['#FF1200', '#840023'], // 1 - red
            ['#0074FF', '#01467F'], // 2 - blue
            ['#00AF00', '#006300'], // 3 - green
            ['#FF962E', '#B25000'], // 4 - orange
            ['#A464FF', '#4720C4'], // 5 - purple
            ['#A3A3A3', '#515151'], // 6,7,8,9 - gray
            ['#A3A3A3', '#515151'],
            ['#A3A3A3', '#515151'],
            ['#A3A3A3', '#515151'],
        ]; // hue from 1 to 5

        // jscs:disable maximumLineLength
		//var BACK_PATH = 'm0.5,11c0,-5.524862 4.475138,-10 10,-10c5.524862,0 10,4.475138 10,10c0,5.524862 -4.475138,10 -10,10c-5.524862,0 -10,-4.475138 -10,-10z';//1位数字的圆
		//var BACK_PATH = 'm0.5,12c0,-5.977169 4.743785,-11 10.388888,-11l13.222222,0c5.6451,0 10.388889,5.022831 10.388889,11l0,-1c0,5.977169 -4.74379,11 -10.388889,11l-13.222222,0c-5.645103,0 -10.388888,-5.022831 -10.388888,-11l0,1z';//2位数字的圆角矩形
        //var BACK_PATH = 'M0,13c0,3.866,3.134,7,7,7h6c3.866,0,7-3.134,7-7V7H0V13z';
		var BACK_PATH = 'M 10,0 l 10,0 a 10,10,0,1,1,0,20 l -10,0 a 10,10,0,1,1,0,-20z';
        var MASK_PATH = 'M20,10c0,3.866-3.134,7-7,7H7c-3.866,0-7-3.134-7-7V7c0-3.866,3.134-7,7-7h6c3.866,0,7,3.134,7,7V10z';

        var CORNER_MARK_DATA = 'cornerMark';

        // 进度图标的图形
        var CornerMarkIcon = kity.createClass('CornerMarkIcon', {
            base: kity.Group,

            constructor: function(node) {
                this.callBase();
                this.setSize(node);
                this.create();
                this.setId(utils.uuid('node_cornerMark'));
            },

            setSize: function(node) {
                this.value = node.getData(CORNER_MARK_DATA);
                this.length = this.value.length;
                this.width = 10 * (this.length + 1);
				this.height = 20;
            },

            create: function() {
                var white, back, mask, number; // 4 layer

                white = new kity.Path().setPathData(MASK_PATH).fill('white');
                //back = new kity.Path().setPathData(BACK_PATH).setTranslate(0.5, 0.5);
				//back = new kity.Circle(10,10,10);
                if(this.length == 1){
                    back = new kity.Circle(10,10,10);
                }else{
                    //back = new kity.Rect(this.width,20,0,0);
                    var w = 10 * (this.length - 1);
                    BACK_PATH = "M 10,0 l " + w + ",0 a 10,10,0,1,1,0,20 l -" + w + ",0 a 10,10,0,1,1,0,-20z";
                    back = new kity.Path().setPathData(BACK_PATH)
                }
                //mask = new kity.Path().setPathData(MASK_PATH).setOpacity(0.8).setTranslate(0.5, 0.5);

                console.log(this.width);
				var nX = this.width / 2;
				var nY = this.height / 2;
				// var nX = this.width / 2 + 8;
				// var nY = this.height / 2 + 2;
                number = new kity.Text()
                    .setX(nX)
					.setY(nY)
                    .setTextAnchor('middle')
                    .setVerticalAlign('middle')
                    //.setFontItalic(true)
                    .setFontSize(16)
                    .fill('white');

                this.addShapes([back, number]);
				//this.addShapes([mask, number]);
                this.mask = mask;
                this.back = back;
                this.number = number;
            },

            setValue: function(value) {
                var back = this.back,
                    mask = this.mask,
                    number = this.number;

                //var color = CORNER_MARK_COLORS[value];
				var color = ["#d90000", "#d90000"];

                if (color) {
                    back.fill(color[1]);
                    //mask.fill(color[0]);
                }

                number.setContent(value);
            }
        });

        /**
         * @command CornerMark
         * @description 设置节点的优先级信息
         * @param {number} value 要设置的优先级（添加一个优先级小图标）
         *     取值为 0 移除优先级信息；
         *     取值为 1 - 9 设置优先级，超过 9 的优先级不渲染
         * @state
         *    0: 当前有选中的节点
         *   -1: 当前没有选中的节点
         */
        var CornerMarkCommand = kity.createClass('SetCornerMarkCommand', {
            base: Command,
            execute: function(km, value) {
                var nodes = km.getSelectedNodes();
                for (var i = 0; i < nodes.length; i++) {
                    nodes[i].setData(CORNER_MARK_DATA, value || null).render();
                }
                km.layout();
            },
            queryValue: function(km) {
                var nodes = km.getSelectedNodes();
                var val;
                for (var i = 0; i < nodes.length; i++) {
                    val = nodes[i].getData(CORNER_MARK_DATA);
                    if (val) break;
                }
                return val || null;
            },

            queryState: function(km) {
                return km.getSelectedNodes().length ? 0 : -1;
            }
        });
        return {
            'commands': {
                'cornerMark': CornerMarkCommand
            },
            'renderers': {
                left: kity.createClass('CornerMarkRenderer', {
                    base: Renderer,

                    create: function(node) {
                        return new CornerMarkIcon(node);
                    },

                    shouldRender: function(node) {
                        return node.getData(CORNER_MARK_DATA);
                    },

                    update: function(icon, node, box) {
                        var data = node.getData(CORNER_MARK_DATA);
                        var spaceLeft = node.getStyle('space-left'),
							spaceTop = node.getStyle('space-top'),
                            spaceRight = node.getStyle('space-right'),
                            x, y;
                        console.log("spaceRight:"+spaceRight);

                        icon.setValue(data);
                        //x = box.left - icon.width - spaceLeft;
						//y = -icon.height / 2;
                        console.log(box.width);
                        console.log(icon.width);
						x = box.right + 20 - icon.width / 2;
                        console.log("x:"+x);
						y = -3*spaceTop -icon.height/2;

                        icon.setTranslate(x, y);

                        return new kity.Box({
                            //x: x,
                            //y: y,
							x: 0,
							y: 0,
                            //width: icon.width,
                            //height: icon.height
							width: 0,
							height: 0
                        });
                    }
                })
            }
        };
    });
});