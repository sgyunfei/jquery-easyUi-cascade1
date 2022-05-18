// 自定义四级分类
(function ($) {
    $.fn.fourLevel = $.fn.fourLevel || {};

    $.fn.fourLevel = function (parameter, param) {
        if (typeof parameter == 'string') {
            var method = $.fn.fourLevel.methods[parameter];
            if (method) {
                return method(this, param);
            } else {
                return this.combobox(options, param);
            }
        }
        //当该组件在一个页面出现多次时，this是一个集合，故需要通过each遍历。
        return this.each(function () {
            /*  $(this).combobox({
                  width: '0px',
              })
              $(this).parent().children('.textbox').css({display: 'none'}) //隐藏传入的元素渲染*/

            //重组参数
            if (parameter.params) {
                var params = ''
                $.each(Object.keys(parameter.params), (index, key) => {
                    if (index === 0) {
                        params += key + '=' + parameter.params[key]
                    } else {
                        params += '&' + key + '=' + parameter.params[key]
                    }

                })
                $.fn.fourLevel.data.params = params
                //记录传递的查询参数
                $.fn.fourLevel.data.recordParams = parameter.params
            }

            //重置配置
            if (parameter.options) {
                $.each(Object.keys(parameter.options), (index, key) => {
                    if (key === 'showBtn') {
                        $.fn.fourLevel.data.showBtn = parameter.options[key]
                    } else if (key === 'required') {
                        $.fn.fourLevel.data.required = parameter.options[key]
                    } else if (key === 'requiredLength') {
                        $.fn.fourLevel.data.requiredLength = parameter.options[key]
                    } else if (key === 'readonly') {
                        if (parameter.options[key]) {
                            $(this).addClass('fourLevel-readonlyDialog')
                            $.fn.fourLevel.data.readonly = parameter.options[key]
                        }
                    } else if (key === 'data') {
                        var setData = typeof (parameter.options[key]) == 'object' ? parameter.options[key] : JSON.parse(parameter.options[key])
                        if (setData && setData.length > 0) {
                            $.fn.fourLevel.data.groups = []
                            $.each(setData, function (index, obj) {
                                $.fn.fourLevel.data.groups.push({
                                    groupIndex: index,
                                    groupName: '第' + index + '组',
                                    groupData: obj
                                })
                            })
                        }
                    } else if (key === 'groups') {
                        if (Number(parameter.options[key]) > 1) {
                            /*组数可以自定义*/
                        } else {
                            $.fn.fourLevel.data.groups = [{groupIndex: 0, groupName: '第0组'}]
                        }
                    } else {
                        $.fn.fourLevel.data.options.push({
                            key: parameter.options[key]
                        })
                    }
                })
            }

            //重置样式
            if (parameter.style) {
                $.each(Object.keys(parameter.style), (index, key) => {
                    if (key === 'levelWidthNum' && parameter.style.levelWidthNum === 4) {
                        $.fn.fourLevel.data.selectWidth = '23%';
                        $.fn.fourLevel.data.btnWidth = '8%';
                    } else if (key === 'level') {
                        $.fn.fourLevel.data.level = Number(parameter.style.level)
                    }
                })
            }

            //筛选
            if (parameter.filter && parameter.filter.showId) {
                if (typeof (parameter.filter.showId) == 'object') {
                    $.fn.fourLevel.data.filterArray = parameter.filter.showId
                } else {
                    $.fn.fourLevel.data.filterArray = parameter.filter.showId.split(',')
                }
            }

            //重置方法
            if (parameter.onChange) {
                $.fn.fourLevel.methods['onChange'] = parameter.onChange
            }
            if (parameter.onSelect) {
                $.fn.fourLevel.methods['onSelect'] = parameter.onSelect
            }

            //如果当前页面已经渲染 不二次渲染
            if (!$(this).find('.fourLevel-warp').length > 0) {
                //追加自定义搜索框
                $(this).parents('.ray-form-group').before(`
                    <div class="ray-form-group ray-col-12 ${parameter.options?.readonly ? 'fourLevel-readonlyDialog' : ''}" id="fourLevelSearchBox">
                        <label class="textbox-label textbox-label-before" title="分类检索">分类检索</label>
                        <input class="easyui-textbox" id="fourLevelSearch" name="fourLevelSearch"
                               data-options="{width:'60%',prompt:'请输入'}"/>
                    </div>`)
                $(this).append('<div class="fourLevel-warp"></div>')
                $(this).css('flex', 1)

                //渲染四级分类
                $.fn.fourLevel.methods.initForm($(this))
                //快捷搜索
                $.fn.fourLevel.methods.search($(this))
            } else {
                //有传递新的参数 需要刷新接口数据
                if (parameter.params || parameter.filter) {
                    //对已经渲染了的组件执行重新接收参数方法
                    var groups = $(this).find('.fourLevel-warp').find('.fourLevel-group');
                    $.each(groups, (groupsIndex, groupsItem) => {
                        var column = $(groupsItem).find('.fourLevel-column')
                        $.each(column, function (columnIndex, columnItem) {
                            var select = $(columnItem).find('.fourLevel-select')
                            //只跟新第一个url 并且清空当前选中的值
                            if (columnIndex === 0) {
                                var url = '/flowlevel/getFirstClass?' + $.fn.fourLevel.data.params
                                select.combobox('reload', url)
                                //非只读情况下清空
                                if (!$.fn.fourLevel.data.readonly) {
                                    select.combobox('clear')
                                }
                            } else {
                                //非只读情况下清空
                                if (!$.fn.fourLevel.data.readonly) {
                                    select.combobox('clear')
                                }
                            }
                        })
                    })
                    //根据搜索查询的参数
                    $.fn.fourLevel.methods.search($(this))
                }
            }
        });
    };

    $.fn.fourLevel.data = {
        required: false,
        requiredLength: 2, //验证必填的个数 默认为2
        readonly: false,
        groups: [{groupIndex: 0, groupName: '第0组'}],//默认渲染固定一组,也可渲染多组
        isClear: true, // 动态赋值的时候不需要清空联动 选择的时候需要清空联动选择
        level: 4,
        levelWidthNum: 2, //一行展示分类得数量
        btnWidth: '8%',
        selectWidth: '46%',
        params: '',//接口传递参数
        recordParams: {},//传递过来的参数
        filterArray: [], //需要展示的数组
        options: {  //配置参数
        },
        showBtn: true,
        style: {},
        defaultOptions: {}
    }
    $.fn.fourLevel.methods = {
        //创建元素
        initForm(jq) {
            var groups = $.fn.fourLevel.data.groups
            //循环组
            $.each(groups, function (index, item) {
                //追加下拉列
                $.fn.fourLevel.methods.pushGroup(jq, index, item.groupData)
                $.fn.fourLevel.methods.hideDelIcon(jq)
            })
        },
        pushGroup(jq, index, data) {
            //如果有传索引 设置索引为当前索引 //追加组外层
            jq.find('.fourLevel-warp').append(`<div class="fourLevel-group" style="margin-bottom: 8px"></div>`)

            var selectWidth = $.fn.fourLevel.data.selectWidth //宽度
            var btnWidth = $.fn.fourLevel.data.btnWidth //按钮宽度

            //创建列level
            for (var i = 1; i <= $.fn.fourLevel.data.level; i++) {
                //如果有默认值 赋值默认值
                var defaultValue = data && data.length > 0 && data[i - 1] ? data[i - 1].id : '';
                var selectHtml = `<div class="fourLevel-column" style="width:${selectWidth};display: inline-block">
                                                <input class="easyui-combobox fourLevel-select fourLevel-select${i}" data-options="
                                                     url:${i} === 1 ? '/flowlevel/getFirstClass?' + $.fn.fourLevel.data.params : '',
                                                     valueField: 'id',
                                                     textField: 'name',
                                                     width:'100%',
                                                     value:'${defaultValue}',
                                                     required:$.fn.fourLevel.data.required && ${i}<= $.fn.fourLevel.data.requiredLength,
                                                     loadFilter:function(data){
                                                          if(${i} == 1){
                                                             return $.fn.fourLevel.methods.fourFilter(data,$(this))
                                                          }else{
                                                             return data  
                                                          }
                                                     },
                                                     onChange:function(rec){
                                                            $.fn.fourLevel.methods.fourOnChange($(this),rec,${i});
                                                     },
                                                     onSelect:function(rec){
                                                            $.fn.fourLevel.methods.fourOnSelect($(this),rec,${i});
                                                     }"</div>`
                $('.fourLevel-group').eq(index).append(selectHtml)
            }

            //如果显示按钮追加按钮并且非只读的情况下追加操作按钮
            if ($.fn.fourLevel.data.showBtn && !($.fn.fourLevel.data.readonly)) {
                var button = `<div class="fourLevel-button" style="width:${btnWidth};display:inline-block;text-align: right;vertical-align: middle">
                                    <i style="margin-left: 10px;color: #666;cursor: pointer;" class="fa fa-plus-square" aria-hidden="true"></i>
                                    <i style="margin-left: 10px;color: #666;cursor: pointer;" class="fa fa-minus-square" aria-hidden="true"></i>
                                  </div>`

                $('.fourLevel-group').eq(index).append(button)

                $('.fourLevel-group').eq(index).find('.fa-plus-square').bind('click', function () {
                    $.fn.fourLevel.data.groups.push({
                        groupIndex: $.fn.fourLevel.data.groups.length,
                        groupName: `第${$.fn.fourLevel.data.groups.length}组`
                    })
                    //设置索引
                    $.fn.fourLevel.methods.pushGroup(jq, $.fn.fourLevel.data.groups.length - 1)
                    $.fn.fourLevel.methods.showDelIcon(jq)
                })

                $('.fourLevel-group').eq(index).find('.fa-minus-square').bind('click', function () {
                    var deleteIndex = $(this).parents('.fourLevel-group').index()
                    $.fn.fourLevel.data.groups.splice(deleteIndex, 1)
                    jq.find('.fourLevel-warp').find('.fourLevel-group').eq(deleteIndex).remove()
                    $.fn.fourLevel.methods.hideDelIcon(jq)

                    //删除触发四级分类改变事件 预警分值可更新
                    if ($.fn.fourLevel.methods['onChange']) {
                        $.fn.fourLevel.methods.onChange()
                    }
                })
            }

            $.parser.parse($('.fourLevel-group').eq(index)); //动态追加的元素 需要手动执行渲染
        },
        /*hideAllIcon(jq) {
                 jq.find('.fourLevel-warp').find('.fa-minus-square').hide()
                 jq.find('.fourLevel-warp').find('.fa-plus-square').hide()
        },*/
        showDelIcon(jq) {
            jq.find('.fourLevel-warp').find('.fa-minus-square').show()
        },
        hideDelIcon(jq) {
            var groupsLength = $.fn.fourLevel.data.groups.length
            if (groupsLength <= 1) {
                jq.find('.fourLevel-warp').find('.fa-minus-square').hide()
            } else {
                jq.find('.fourLevel-warp').find('.fa-minus-square').show()
            }
        },
        options: function (jq) {
            return $.data(jq[0], 'combobox').options;
        },
        fourFilter(data, jq) {
            var newData = []
            if ($.fn.fourLevel.data.filterArray.length > 0) {
                var filterArray = $.fn.fourLevel.data.filterArray
                $.each(data, function (index, item) {
                    if (filterArray.includes(item.id)) {
                        newData.push(item)
                    }
                })
            } else {
                newData = data
            }
            return newData
        },
        fourOnChange(that, rec, index) { //改变事件
            if ($.fn.fourLevel.data.isClear) {
                that.parents('.fourLevel-group').find('.fourLevel-select' + (index + 1)).combobox('clear')
            }
            if ($.fn.fourLevel.methods['onChange']) {
                $.fn.fourLevel.methods.onChange()
            }
            if ($.fn.fourLevel.methods['onSelect']) {
                $.fn.fourLevel.methods.onSelect()
            }
        },
        fourOnSelect(that, rec, index) { //选中事件
            var parameter = $.fn.fourLevel.data.recordParams
            var params = ''
            $.each(Object.keys(parameter), (index, key) => {
                if (key !== 'flowCode') {
                    params += '&' + key + '=' + parameter[key]
                }
            })
            var url = '/flowlevel/getOtherClass?pId=' + rec.id + params;

            var nextSelect = that.parents('.fourLevel-group').find('.fourLevel-select' + (index + 1))
            nextSelect.combobox('reload', url);
            //自定义分值
            that.attr('score', rec.score || '')
        },
        //获取最大值
        getMaxScore: function (jq) {
            //定义分值数组
            var scoreArray = ''
            var groups = jq.find('.fourLevel-warp').find('.fourLevel-group');
            $.each(groups, (groupsIndex, groupsItem) => {
                var column = $(groupsItem).find('.fourLevel-column')
                $.each(column, function (columnIndex, columnItem) {
                    var select = $(columnItem).find('.fourLevel-select')
                    if (select.combobox('getValue')) {
                        scoreArray = select.attr('score') ? select.attr('score') : ''
                    }
                })
            })
            return scoreArray
        },
        // 设置只读
        setReadonly: function (jq) {
            $.fn.fourLevel.data.readonly = true
            jq.addClass('fourLevel-readonlyDialog') //添加只读遮罩层
            jq.parent().prev().find('#fourLevelSearch').parent().addClass('fourLevel-readonlyDialog') //分类搜索只读
            jq.find('.fourLevel-warp').form("disableValidation") //禁用验证
            //循环设置只读
            var groups = jq.find('.fourLevel-warp').find('.fourLevel-group');
            $(groups).find('.fourLevel-button').hide() //隐藏添加删除
            jq.parent().prev().find('#fourLevelSearch').combobox('readonly', true) //分类搜索设置只读

            //循环设置只读
            $.each(groups, (groupsIndex, groupsItem) => {
                var column = $(groupsItem).find('.fourLevel-column')
                $.each(column, function (columnIndex, columnItem) {
                    var select = $(columnItem).find('.fourLevel-select')
                    select.combobox('readonly', true)
                })
            })
        },
        setUnReadonly: function (jq) {
            $.fn.fourLevel.data.readonly = false
            jq.removeClass('fourLevel-readonlyDialog') //添加只读遮罩层
            jq.parent().prev().find('#fourLevelSearch').parent().removeClass('fourLevel-readonlyDialog') //分类搜索只读
            jq.find('.fourLevel-warp').form("enableValidation") //禁用验证
            //循环设置只读
            var groups = jq.find('.fourLevel-warp').find('.fourLevel-group');
            $(groups).find('.fourLevel-button').show() //隐藏添加删除
            jq.parent().prev().find('#fourLevelSearch').combobox('readonly', false) //分类搜索设置只读

            //循环取消只读
            $.each(groups, (groupsIndex, groupsItem) => {
                var column = $(groupsItem).find('.fourLevel-column')
                $.each(column, function (columnIndex, columnItem) {
                    var select = $(columnItem).find('.fourLevel-select')
                    select.combobox('readonly', false)
                })
            })
        },
        getValue: function (jq) {
            var groupsArray = [] //整理数据的数组
            var groups = jq.find('.fourLevel-warp').find('.fourLevel-group')
            $.each(groups, (groupsIndex, groupsItem) => {
                var columnArray = []
                var column = $(groupsItem).find('.fourLevel-column')
                $.each(column, function (columnIndex, columnItem) {
                    var select = $(columnItem).find('.fourLevel-select')
                    if (select.combobox('getValue')) { //有值才创建
                        columnArray.push({
                            id: select.combobox('getValue'),
                            name: select.combobox('getText')
                        })
                    }
                })
                if (columnArray.length > 0) { //避免传递空数组
                    groupsArray.push(columnArray)
                }
            })
            return JSON.stringify(groupsArray)
        },
        setValue: function (jq, setData) {
            if (!setData) {
                return
            }
            //转换数据格式
            var data = typeof (setData) == 'object' ? setData : JSON.parse(setData)
            //不允许清空联动值
            $.fn.fourLevel.data.isClear = false
            //传递的数据有多少组
            var dataLength = data.length
            var groupLength = jq.find('.fourLevel-warp').find('.fourLevel-group').length //当前页面有几组下拉
            if (groupLength < dataLength) {
                var addLength = dataLength - groupLength  //需要动态创建的组数
                for (var i = 0; i < addLength; i++) {
                    $.fn.fourLevel.data.groups.push({
                        groupIndex: groupLength + i,
                        groupName: `第${groupLength + i}组`
                    })
                    //创建一条
                    $.fn.fourLevel.methods.pushGroup(jq, $.fn.fourLevel.data.groups.length - 1, [], true)
                    $.fn.fourLevel.methods.showDelIcon(jq)
                }
            }

            //避免先设置只读 再赋值 不然值会被清空了
            if ($.fn.fourLevel.data.readonly && groupLength < dataLength) {
                $.fn.fourLevel.methods.setReadonly(jq)
            }
            //创建完 再赋值
            var groups = jq.find('.fourLevel-warp').find('.fourLevel-group');
            $.each(groups, (groupsIndex, groupsItem) => {
                var column = $(groupsItem).find('.fourLevel-column')
                $.each(column, function (columnIndex, columnItem) {
                    var select = $(columnItem).find('.fourLevel-select')
                    //必须要在数据加载完成之后赋值 避免过早赋值 渲染时值被清空
                    select.combobox({
                        onLoadSuccess: function () {
                            //设置值 并且是不可清空状态
                            if (data[groupsIndex] && !$.fn.fourLevel.data.isClear) {
                                var selectValue = data[groupsIndex][columnIndex]?.id

                                if (selectValue) {
                                    var comboboxData = select.combobox('getData')
                                    var comboboxDataID = [] //下拉id集合
                                    $.each(comboboxData, function (index, item) {
                                        if (item) {
                                            comboboxDataID.push(item.id)
                                        }
                                    })

                                    //如果当前值不在下拉里 追加到下拉框 避免出现编码问题
                                    if (!(comboboxDataID.includes(selectValue))) {
                                        comboboxData.push({
                                            id: selectValue,
                                            name: data[groupsIndex][columnIndex]?.name
                                        })
                                        // select.combobox('loadData', comboboxData)
                                    }

                                    //第一个值 判断当前下拉里是否存在这个数据
                                    if (columnIndex == 0 && comboboxData.length > 0 && !(comboboxDataID.includes(selectValue))) {
                                        //如果有过滤方法 把当前id传递到过滤数组 避免过滤掉
                                        if ($.fn.fourLevel.data.filterArray.length > 0) {
                                            //避免过滤掉
                                            if (!($.fn.fourLevel.data.filterArray.includes(selectValue))) {
                                                $.fn.fourLevel.data.filterArray.push(selectValue)
                                            }
                                        }
                                    }

                                    select.combobox('setValue', selectValue)
                                } else {
                                    select.combobox('clear')
                                }

                                //恢复是否需要清空
                                if (groupsIndex == (groups.length - 1) && columnIndex == (column.length - 1)) {
                                    setTimeout(function () {
                                        $.fn.fourLevel.data.isClear = true //允许清空联动值
                                    }, 300)
                                }
                            }
                        }
                    })
                })
            })
        },
        search: function (jq) {
            var canChange = false;
            var searchParam = $.fn.fourLevel.data.recordParams
            //快捷搜索
            $('#fourLevelSearch').combobox({
                valueField: 'id',
                textField: 'name',
                mode: 'remote',
                url: $.ext.getContextPath() + "/flowlevel/quickSearch",
                onBeforeLoad: function (param) {
                    param.keyWord = param.q
                    param.rows = 999
                    //传递过来的查询条件
                    $.each(Object.keys(searchParam), function (index, key) {
                        if (key === 'flowCode') {
                            param.topFlowCode = searchParam[key]
                        } else {
                            param[key] = searchParam[key]
                        }
                    })

                    if (param == null || param.q == null || param.q.replace(/ /g, '') == '') {
                        var value = $(this).combobox('getValue');
                        if (value) {// 修改的时候才会出现q为空而value不为空
                            param.id = value;
                            return true;
                        }
                        return false;
                    }
                },
                loadFilter: function (data) {
                    //如果传递了过滤条件的 需要筛选快速搜索的数据
                    var newData = []
                    if ($.fn.fourLevel.data.filterArray.length > 0 && data.length > 0) {
                        $.each(data, function (index, item) {
                            var firstId = item.id.split('>')[0]
                            if ($.fn.fourLevel.data.filterArray.includes(firstId)) {
                                newData.push(item)
                            }
                        })
                    } else {
                        newData = data
                    }
                    return newData
                },
                onSelect: function (select) {
                    canChange = true;
                    var checkedId = select.id.split('>'); //选中的值转换为数组 对数据进行回填
                    var isSearch = false //是否找到了未提交的组
                    //不允许清空联动值
                    $.fn.fourLevel.data.isClear = false
                    //检索哪一行没有值如果有空值 填充
                    var groups = jq.find('.fourLevel-warp').find('.fourLevel-group');
                    $.each(groups, (groupsIndex, groupsItem) => {
                        //判断第一个元素是都有值
                        var column = $(groupsItem).find('.fourLevel-column')[0]
                        var select = $(column).find('.fourLevel-select1')
                        var value = select.combobox('getValue')
                        //给第一组没有值的赋值
                        if ((!value && !isSearch) || !$.fn.fourLevel.data.showBtn) {
                            var column = $(groupsItem).find('.fourLevel-column')
                            $.each(column, function (columnIndex, columnItem) {
                                var select = $(columnItem).find('.fourLevel-select')
                                select.combobox({
                                    onLoadSuccess: function () {
                                        if (!$.fn.fourLevel.data.isClear) {
                                            if (checkedId[columnIndex]) {
                                                select.combobox('setValue', checkedId[columnIndex] || '')
                                            }
                                            //恢复是否需要清空
                                            if (groupsIndex == (groups.length - 1) && columnIndex == (column.length - 1)) {
                                                setTimeout(function () {
                                                    $.fn.fourLevel.data.isClear = true //允许清空联动值
                                                }, 300)
                                            }
                                        }
                                    },
                                    onChange: function (rec) {
                                        $.fn.fourLevel.methods.fourOnChange($(this), rec, columnIndex + 1);
                                    },
                                    onSelect: function (rec) {
                                        $.fn.fourLevel.methods.fourOnSelect($(this), rec, columnIndex + 1);
                                    },
                                })
                            })
                            isSearch = true
                        }
                    })
                    //如果都有值则新增
                    if (!isSearch) {
                        $.fn.fourLevel.data.groups.push({
                            groupIndex: $.fn.fourLevel.data.groups.length,
                            groupName: `第${$.fn.fourLevel.data.groups.length}组`
                        })
                        //设置追加一组元素
                        $.fn.fourLevel.methods.pushGroup(jq, $.fn.fourLevel.data.groups.length - 1)
                        $.fn.fourLevel.methods.showDelIcon(jq)

                        //回填搜索得数据
                        var groupsIndexBox = jq.find('.fourLevel-warp').find('.fourLevel-group').eq($.fn.fourLevel.data.groups.length - 1)
                        //行数
                        var column = groupsIndexBox.find('.fourLevel-column')
                        $.each(column, function (columnIndex, columnItem) {
                            var select = $(columnItem).find('.fourLevel-select')
                            select.combobox('setValue', checkedId[columnIndex] || '')
                        })
                    }

                    //清楚自身的值
                    setTimeout(() => {
                        $(this).combobox('clear')
                    }, 300)

                    //触发改变事件
                    if ($.fn.fourLevel.methods['onChange']) {
                        $.fn.fourLevel.methods.onChange()
                    }
                },
                onChange: function (oldValue, newValue) {
                    if (canChange) {
                        canChange = false;
                        // $(this).combobox('setValue', newValue).combobox('setText', newValue);
                    }
                }
            });
        }
    };

    // $.parser.plugins.push("fourLevel");//注册扩展组件 直接注册的话 会自行调用一次
})(jQuery);




