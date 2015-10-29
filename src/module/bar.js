define(function(require, exports, module) {
    var kity = require('../core/kity');
    var utils = require('../core/utils');

    var Minder = require('../core/minder');
    var MinderNode = require('../core/node');
    var Command = require('../core/command');
    var Module = require('../core/module');
    var Renderer = require('../core/render');

    Module.register('barModule', function() {
        var minder = this;

        // Designed by Akikonata
        // [MASK, BACK]
        var BAR_COLORS = [null, ['#FF1200', '#840023'], // 1 - red
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
        //var BACK_PATH = 'M0,13c0,3.866,3.134,7,7,7h6c3.866,0,7-3.134,7-7V7H0V13z';
		var BACK_PATH = 'M 0,0 L 100,0 L 100,7 L 0,7 L 0,0 z';
        var MASK_PATH = 'M20,10c0,3.866-3.134,7-7,7H7c-3.866,0-7-3.134-7-7V7c0-3.866,3.134-7,7-7h6c3.866,0,7,3.134,7,7V10z';

        var BAR_DATA = 'bar';

        // 进度图标的图形
        var barIcon = kity.createClass('barIcon', {
            base: kity.Group,

            constructor: function(node) {
                this.callBase();
                this.setSize(20);
                this.create(node);
                this.setId(utils.uuid('node_bar'));
            },

            setSize: function(size) {
                this.width = size;
				this.height = size;
            },

            create: function(node) {
				var data = node.getData(BAR_DATA);
				if(data.rate > 1){
					data.rate = 1;
				}
				var width = data.maxWidth * data.rate;//矩形条图实际显示宽度
				BACK_PATH = "M 0,0 L " + width + ",0 L " + width + ",7 L 0,7 L 0,0 z";
                var white, back, mask, number; // 4 layer

                white = new kity.Path().setPathData(MASK_PATH).fill('white');
                back = new kity.Path().setPathData(BACK_PATH).setTranslate(0.5, 0.5);
                mask = new kity.Path().setPathData(MASK_PATH).setOpacity(0.8).setTranslate(0.5, 0.5);
				//var url = "file:///C:/Users/T440P/Documents/kityminder-core/bar.png";
				//var bar = new kity.Image(url);
				//bar.setWidth(100).setHeight(5).setX(0).setY(0);

                number = new kity.Text()
                    //.setX(this.width / 2 - 0.5)
					.setX(width + 15)
					.setY(3)
                    .setTextAnchor('middle')
                    .setVerticalAlign('middle')
                    //.setFontItalic(true)
                    .setFontSize(12)
                    .fill('gray');

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

                //var color = BAR_COLORS[value];
				var color = ["#ff0000", "#3ebea5"];

                if (color) {
                    back.fill(color[1]);
                    mask.fill(color[0]);
                }

                number.setContent(value);
            }
        });

        /**
         * @command bar
         * @description 设置节点的优先级信息
         * @param {number} value 要设置的优先级（添加一个优先级小图标）
         *     取值为 0 移除优先级信息；
         *     取值为 1 - 9 设置优先级，超过 9 的优先级不渲染
         * @state
         *    0: 当前有选中的节点
         *   -1: 当前没有选中的节点
         */
        var barCommand = kity.createClass('SetbarCommand', {
            base: Command,
            execute: function(km, maxWidth, rate, value) {
				var data = {
					maxWidth: maxWidth,
					rate: rate,
					value: value
				};
                var nodes = km.getSelectedNodes();
                for (var i = 0; i < nodes.length; i++) {
                    nodes[i].setData(BAR_DATA, data || null).render();
                }
                km.layout();
            },
            queryValue: function(km) {
                var nodes = km.getSelectedNodes();
                var val;
                for (var i = 0; i < nodes.length; i++) {
                    val = nodes[i].getData(BAR_DATA);
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
                'bar': barCommand
            },
            'renderers': {
                left: kity.createClass('barRenderer', {
                    base: Renderer,

                    create: function(node) {
                        return new barIcon(node);
                    },

                    shouldRender: function(node) {
                        return node.getData(BAR_DATA);
                    },

                    update: function(icon, node, box) {
                        var data = node.getData(BAR_DATA).value;
                        var spaceLeft = node.getStyle('space-left'),
							spaceTop = node.getStyle('space-top'),
                            x, y;

                        icon.setValue(data);
                        //x = box.left - icon.width - spaceLeft;
						//y = -icon.height / 2;
						x = -4*spaceLeft - 2;
						y = box.bottom + 10;

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