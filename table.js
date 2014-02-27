//backbone.js
$(function(){

	//Model
	var Guest =Backbone.Model.extend({
		//set default
		defaults:function(){
			return{
				name:"XXX",
				age:"0",
				selected:false,
				id:Guests.nextId(),
			};
		},
		
		//initialize
		initialize:function(){
			if(!this.get("name")){
				this.set({"name":this.defaults().name});
			}
			if(!this.get("age")||!(/(^[1-9]\d*$)/.test(this.get("age")))){
				this.set({"age":this.defaults().age});
			}
		},

		//toggle
		toggle:function(){
			this.save({selected:!this.get("selected")});
		}
	});

	//Collection:Model
	var Guests=Backbone.Collection.extend({
		
		model:Guest,
		
		//backbone-localstorage.js
		localStorage:new Backbone.LocalStorage("Guests-Table"),

		//selected
		selected:function(){
			return this.filter(function(guest){return guest.get('selected');});
		},

		//nextID
		nextId:function(){
			if(!this.length)
				return 1;
			return this.last().get('id')+1;
		}
	});

	//create new students
	var Guests=new Guests;


	//View
	var GuestView=Backbone.View.extend({
		
		tagName:"tr",
		
		//load template by _.template() underscore.js
		template:_.template($('#item-template').html()),

		//set up event
		events:{
			"click .toggle":"toggleSelect",
			"dblclick td":"edit",
			"click a.destroy":"clear",
			"blur .edit":"close"
		},

		//View listenTo model
		initialize:function(){
			
			this.listenTo(this.model,'change',this.render);
			
			this.listenTo(this.model,'destroy',this.remove);
		},

		render:function(){
			this.$el.html(this.template(this.model.toJSON()));
			
			this.$el.toggleClass('selected',this.model.get('selected'));
			return this;
		},

		//model selected
		toggleSelect:function(){
			this.model.toggle();
		},

		edit:function(e){
			$(e.currentTarget).addClass("editing").find("input,select").focus();
		},

		close:function(e){
			var input=$(e.currentTarget);

			if(input.attr('name')=="name"){
				if(!input.val()){
					input.val(this.model.defaults().name);
				}
				this.model.save({"name":input.val()});
			}else if(input.attr('name')=="gender"){
				if(!input.val()||!(/(^[1-9]\d*$)/.test(input.val()))){
					input.val(this.model.defaults().age);
				}
				this.model.save({"gender":input.val()});
			}else{
				this.model.save({"age":input.val()});
			}
			input.parent().removeClass("editing");
		},

		clear:function(){
			this.model.destroy();
		}
	});


	//View: $("#content")
	var AppView=Backbone.View.extend({
		el:$("#content"),

		statsTemplate:_.template($('#stats-template').html()),

		events:{
			"click #add-guest":"addNewGuest",
			"click #clear-selected":"clearSelected",
			"click #select-all":"selectAll"
		},

		initialize:function(){
			this.allCheckbox=$("#select-all");
			this.main=$("#main");
			this.footer=$('footer');
			this.name=$("#new-name");
			this.age=$("#new-age");
			this.gender=$("#new-gender");

			//Collection
			this.listenTo(Guests,'add',this.addOne);
			//fetch reset
			this.listenTo(Guests,'reset',this.addAll);
			//View all
			this.listenTo(Guests,'all',this.render);

			Guests.fetch();
		},

		
		render:function(){
			var selected=Guests.selected().length;
			
			if(Guests.length){
				this.main.show();
				this.footer.show();
				this.footer.html(this.statsTemplate({selected:selected}));
			}else{
				this.main.hide();
				this.footer.hide();
			}
			
			this.allCheckbox.attr("checked",selected==Guests.length?true:false);
		},

		addOne:function(guest){
			var view=new GuestView({model:guest});
		
			this.$("#guest-list").append(view.render().el);
		},

		addAll:function(){
			Guests.each(this.addOne,this);
		},

		addNewGuest:function(){
			Guests.create({name:this.name.val(),gender:this.gender.val(),age:this.age.val()});
			this.name.val('');
			this.age.val('');
			this.gender.val(1);
		},

		//_.invoke
		clearSelected:function(){
			_.invoke(Guests.selected(),'destroy');
		},

		selectAll:function(){
			var selected=this.allCheckbox.attr('checked')=="checked";
			Guests.each(function(guest){
				guest.save({'selected':selected});
			});
		}
	});

	var App=new AppView;
});