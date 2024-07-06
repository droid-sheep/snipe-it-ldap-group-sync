const ldap = require('ldapjs');
const axios = require("axios");

// #### do not modify above ####

const ldapHost = "<Your_LDAP_Server>";
const bindUser = "<Your_LDAP_Admin_User_DN>";
const bindPassword = "<Your_LDAP_Admin_User_Password>";

const snipeServer = "<Your_Public_Snipe_Instance_Base_URL>";
const snipePassword = "<Your_Snipe_API_Key>";

const ldapGroupDN = "<DN_of_Your_Users>";
const ldapUserDN = "<DN_of_Your_Groups>";

const ldapTimeout = 60; //one try waits for 1 sec

// #### do not modify below ####

const snipeHeaders = {
	headers: {
		Accept: "application/json",
		"Content-Type": "application/json",
		Authorization: "Bearer "+snipePassword
	}		
}


const client = ldap.createClient({
  url: [ldapHost]
});

client.on('connectError', (err) => {
  // handle connection error
  console.log("error while connecting to ldap");
  process.exit(0);
})

var counter = 0;
var maxCounter;
var groupMapping = [];
var userMapping = [];

client.on("connect", (err) => {
	console.log("connected");
	
	client.bind(bindUser, bindPassword, (err) => {
		
		if(err){
			console.log("error while binding to admin user");
			process.exit(0);
		}
		
		console.log("binded with ldap admin user");
		console.log("fetching groups from snipe");
		
		axios.get(snipeServer+"/api/v1/groups", snipeHeaders).then((response) => {
			const groups = response.data.rows;
				
			console.log("got "+groups.length+" groups");
			
			maxCounter = groups.length;
			
			axios.get(snipeServer+"/api/v1/users", snipeHeaders).then((response) => {
				
				userIdMap = [];
				
				response.data.rows.forEach((u) => {
					userIdMap[u.username.toLowerCase()] = u.id;
				});
				
				groups.forEach((g) => {
					groupMapping[g.name] = g.id;
					
					let groupName = g.name;
					let groupId = g.id;
					let members = [];
					
					
					
					client.search(ldapUserDN, {
						filter: "(memberOf=CN="+groupName+","+ldapGroupDN+")",
						scope: "sub",
						attributes: ["cn", "sAMAccountName"]
					}, (err, res) => {
						if (err) console.log(err);
						
						  res.on('searchEntry', (entry) => {							
							let username = entry.pojo.attributes[1].values[0];
							
							if(userIdMap[username.toLowerCase()]){
								//user exists in mapping
								
								username = userIdMap[username.toLowerCase()];
							
								if(userMapping[username]){
									userMapping[username].push(groupId);
								}else{
									userMapping[username] = [groupId];
								}
							}else{
								console.log("ldap user not found in mapping");
							}
						  });
						  
						  res.on('error', (err) => {
							console.error('error: ' + err.message);
						  });
						  
						  res.on('end', (result) => {
							console.log("ldap finished for "+groupName);
							counter++;
						  });
					});
				});
				
				validate();
			}).catch((e) => {
				console.log(e);
				process.exit(0);
			});
		}).catch((e) => {
			console.log(e);
			process.exit(0);
		});
	});
});

repeatCounter = 0;

function validate(){
	console.log("checking if finished");

	if(repeatCounter >= ldapTimeout){
		console.log("exceeded retry count -> exiting");
		process.exit(0);
	}
	
	if(counter==maxCounter){
		console.log("all groups checked -> disconnecting ldap");
		
		client.unbind((err) => {
		  if(err){
			  console.log("failed to disconnect ldap", err);
		  }else{
			  console.log("disconnected ldap");
		  }
		});
		
		for(var m in userMapping){
			
			axios.patch(snipeServer+"/api/v1/users/"+m, {
				groups: userMapping[m]
			}, snipeHeaders).then((r) => {
				
				if(r.data.status == "success"){
					console.log("Update finished for ", r.data.payload.username);
				}else{
					console.log("Update failed for ", r.data.payload.username);
				}
			});
		}
	}else{
		console.log("ldap not finished -> retrying");
		repeatCounter++;
		setTimeout(() => validate(), 1000);
	}
}