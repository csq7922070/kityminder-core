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
                this.width = 10 * (this.length + 1);//圆或圆角矩形的宽度，1位数字用圆，2位及以上用圆角矩形
				this.height = 20;
            },

            create: function() {
                var back, number;
                if(this.length == 1){//用圆形背景
                    back = new kity.Circle(10,10,10);
                }else{//用圆角矩形背景
                    var w = 10 * (this.length - 1);//圆角矩形中间直线部分宽度
                    BACK_PATH = "M 10,0 l " + w + ",0 a 10,10,0,1,1,0,20 l -" + w + ",0 a 10,10,0,1,1,0,-20z";
                    back = new kity.Path().setPathData(BACK_PATH)
                }

				var nX = this.width / 2;
				var nY = this.height / 2;
                number = new kity.Text()
                    .setX(nX)
					.setY(nY)
                    .setTextAnchor('middle')
                    .setVerticalAlign('middle')
                    //.setFontItalic(true)
                    .setFontSize(16)
                    .fill('white');

                this.addShapes([back, number]);
                this.back = back;
                this.number = number;
            },

            setValue: function(value) {
                var back = this.back,
                    number = this.number;

                //var color = CORNER_MARK_COLORS[value];
				var color = "#d90000";

                back.fill(color);

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
                        var spaceTop = node.getStyle('space-top'),
                            x, y;

                        icon.setValue(data);
						x = box.right + 20 - icon.width / 2;
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