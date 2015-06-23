(function() {
  console.log('way up here woop')
  // console.log(this.ticket())\
  console.log(this)
  return {
    appID:  'hide_brands_app_based_on_current_user',    
    groupBrandMapping: {},
    mappedObject: {},
    userInfo: {},
    brandInfo: {}, 
    requests: { // AJAX Calls below
      fetchUserGroupInfo: function(userId) {
        return {
          url: '/api/v2/users/'+userId+'/groups.json',
          type: 'GET',
          dataType: 'json',
          proxy_v2: true
        };
      },
      fetchBrandInfo: function() {
        return {
          url: '/api/v2/brands.json',
          type: 'GET',
          dataType: 'json',
          proxy_v2: true
        };
      },
    },
    // Event declaration below
    events: {
      'app.activated':'init',
      'fetchUserGroupInfo.done': 'this.showUserInfo',
      'fetchBrandInfo.done': 'this.showBrandInfo'
    },

    // Defining Events below
    init: function(){ // gets currentUser ID, fire AJAX call to API for user associated groups, fires AJAX call to API for ticket all brands
      var currentUserId = this.currentUser().id();
      _.each(this.ticketFields('brand').options(), function(brand){
        brand.hide();
      });
      this.ajax('fetchUserGroupInfo', currentUserId);
      this.ajax('fetchBrandInfo');

    },
    showUserInfo: function(data){ // displays user associated groups, sets AJAX data to global userInfo variable
      this.settings.userInfo = data;
    },
    showBrandInfo: function(data){ // displays ticket brands info, sets AJAX data to global brandInfo variable, also parses required parameter into mappedObject JSON format, pass mappedObect to 
      this.settings.brandInfo = data;
      this.settings.mappedObject = JSON.parse(this.settings.groupBrandMapping);
      this.accessMappedObj(this.settings.mappedObject);
    }, 
    accessMappedObj: function(obj){ // access user group associated info, group <-> brand info, and ticket brands info. Equality check for user group id and mapped group id. Get brand id and check for matching ticket brand to hide.
      var windowThis = this;

      setTimeout((function(){
        var localMappedObject = windowThis.settings.mappedObject;
        var brandOptionsArray = windowThis.ticketFields('brand').options(); 
        var mappedBrandId, mappedGroupIds;
        var storeBrandIdArray = [];

        var userGroupInfoId = _.pluck(_.values(windowThis.settings.userInfo.groups), "id");
        var userGroupInfoName = _.pluck(_.values(windowThis.settings.userInfo.groups), "name");

        _.each(userGroupInfoId, function(id){
          _.each(localMappedObject, function(group){
            mappedBrandId = group.brandId;
            mappedGroupIds = _.values(group.groupId);
            if (_.contains(mappedGroupIds, id)){
              storeBrandIdArray.push(mappedBrandId);
            }
          });
        });
        var uniqStoreBrandIdArray = _.uniq(storeBrandIdArray);
        _.each(brandOptionsArray, function(brandIdElements){
          if (_.contains(uniqStoreBrandIdArray, brandIdElements.value())){
            brandIdElements.show();
          }
        });
      }),300); // end of setTimeout function
    }
  }; // end initial return, line 3
}());