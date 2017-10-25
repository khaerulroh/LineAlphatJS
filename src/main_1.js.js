const LineAPI = require('./api');
const unirest = require('unirest');
const rp = require('request-promise');
const config = require('./config');
const { Message, OpType, Location } = require('../curve-thrift/line_types');
let exec = require('child_process').exec;

const myBot = ['u446b4e563274a6949a33870ce9c31ede','u62d123fa68518f7fa8ec61990485e1d9' , 'ufafd73f31436d05bbe230b710e577d7b'];//ADMIN MID
var vx = {};var midnornama = "";var pesane = "";var kickhim = "";//DO NOT CHANGE THIS
var banList = [];//Banned list
var waitMsg = "no"; //DO NOT CHANGE THIS
var msgText = "Bro.... ini tes, jangan dibales !";
var bcText = "Anyman BOT Active!";

function isAdminOrBot(param) {
    return myBot.includes(param);
}

function isBanned(banList, param) {
    return banList.includes(param);
}

function firstToUpperCase(str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
}

class LINE extends LineAPI {
    constructor() {
        super();
        this.receiverID = '';
        this.checkReader = [];
        this.stateStatus = {
            cancel: 0,
            kick: 1,
			salam: 1,
			mute: 0,
			protect: 1, //Protect Qr,Kicker
			qr: 0 //0 = Gk boleh, 1 = Boleh
        }
		this.keyhelp = "\n\
====================\n\
[ Keyword List ]\n\n\
\n\
--Free Commnad--\n\
|+|help -> menampilkan keyword\n\
|+|checkid -> melihat id teman\n\
|+|myid -> melihat id akun\n\
|+|stalk -> kepoin orang\n\
|+|msg -> mengirim pesan melalui bot\n\
|+|kickme! -> keluar dari grup\n\
|+|speed -> cek kecepatan jaringan bot\n\
|+|setlastpoint -> mencari menangkap sider\n\
|+|bot creator -> melihat contact pembuat bot\n\
|+|viewlastseen -> melihat sider\n\
|+|clear -> refres bot\n\
|+|ytools -> youtube downloader\n\
\n\
--Admin Bot Command--\n\
|+|banned -> Banned member\n\
|+|sudo cancel -> cancel invitan grup\n\
|+|unbanned -> UnBanned member\n\
|+|bannedlist -> Check Banned List\n\
|+|sudo kickall -> Ratain grup\n\
|+|cancel on/off -> protection invited\n\
|+|protect on/off -> menjaga grup\n\
|+|qr on/off -> melindungi link qr\n\
|+|bot:on/off -> menyalakan/mematikan bot\n\
|+|kick! -> kick member by name\n\
|+|responname -> check respon bot\n\
|+|ourl -> membuka qr\n\
|+|curl -> menutup qr\n\
|+|tagall -> tag semua member grup\n\
|+|kickbanned -> kick banned list dari grup\n\
|+|remove chat -> menghapus balon chat pada bot\n\
|+|clear chat -> menghapus pesan pada bot\n\
\n\
\n\
Admin Conntact: http://line.me/ti/p/6E-YCrIoCu";;
    }

    getOprationType(operations) {
        for (let key in OpType) {
            if(operations.type == OpType[key]) {
                if(key !== 'NOTIFIED_UPDATE_PROFILE') {
                    console.info(`[* ${operations.type} ] ${key} `);
                }
            }
        }
    }

    poll(operation) {
        if(operation.type == 25 || operation.type == 26) {
            //console.info(operation.message);
            const txt = (operation.message.text !== '' && operation.message.text != null ) ? operation.message.text : '' ;
            let message = new Message(operation.message);
            this.receiverID = message.to = (operation.message.to === myBot[0]) ? operation.message.from_ : operation.message.to ;
            Object.assign(message,{ ct: operation.createdTime.toString() });
            if(waitMsg == "yes" && operation.message.from_ == vx[0] && this.stateStatus.mute != 1){
				this.textMessage(txt,message,message.text)
			}else if(this.stateStatus.mute != 1){this.textMessage(txt,message);
			}else if(txt == "bot:on" && isAdminOrBot(operation.message.from_) && this.stateStatus.mute == 1){
			    this.stateStatus.mute = 0;
			    this._sendMessage(message,"Starting Bot")
		    }else{console.info("muted");}
        }

        if(operation.type == 13 && this.stateStatus.cancel == 1) {//someone inviting..
            this.cancelAll(operation.param1);
        }
		
		if(operation.type == 16 && this.stateStatus.salam == 1){//join group
			let halo = new Message();
			halo.to = operation.param1;
			halo.text = "Halo, Salam Kenal ^_^ !";
			this._client.sendMessage(0, halo);
		}
		
		/*if(operation.type == 26){
       this._client.removeAllMessages(operation.param1);
        }*/
        
		if(operation.type == 17 && this.stateStatus.salam == 1 && isAdminOrBot(operation.param2)) {//ada yang join
		    let halobos = new Message();
			halobos.to = operation.param1;
			halobos.toType = 2;
			halobos.text = "Halo bos !, selamat datang di group ini bos !";
			this._client.sendMessage(0, halobos);
		}else if(operation.type == 17 && this.stateStatus.salam == 1){//ada yang join
			let seq = new Message();
			seq.to = operation.param1;
			//halo.siapa = operation.param2;
			this.textMessage("0101",seq,operation.param2,1);
			//this._client.sendMessage(0, halo);
		}
		
		if(operation.type == 15 && isAdminOrBot(operation.param2)) {//ada yang leave
		    let babay = new Message();
			babay.to = operation.param1;
			babay.toType = 2;
			babay.text = "Ada apa bang ? kok leave ?";
			this._invite(operation.param1,[operation.param2]);
			this._client.sendMessage(0, babay);
		}else if(operation.type == 15 && !isAdminOrBot(operation.param2)){
			let seq = new Message();
			seq.to = operation.param1;
			this.textMessage("0102",seq,operation.param2,1);
		}
		
		if(operation.type == 5 && this.stateStatus.salam == 1) {//someone adding me..
            let halo = new Message();
			halo.to = operation.param1;
			halo.text = "";
			this._client.sendMessage(0, halo);
        }

        if(operation.type == 19 && this.stateStatus.autokick == 1) { 
            //ada kick
            // op1 = group nya
            // op2 = yang 'nge' kick
            // op3 = yang 'di' kick
            if(!isAdminOrBot(operation.param2)) {
                this._kickMember(operation.param1,[operation.param2]);
                this._invite(operation.param1,[operation.param3]);              
            } 

        }
		
		if(operation.type == 11 && this.stateStatus.protect == 1){//update group
		    let seq = new Message();
			seq.to = operation.param1;
			this.textMessage("0103",seq,operation.param2,1);
		}else if(operation.type == 11 && this.stateStatus.qr == 1){
			let seq = new Message();
			seq.to = operation.param1;
			this.textMessage("0104",seq,operation.param2,1);
		}

        if(operation.type == 55){ //ada reader

            const idx = this.checkReader.findIndex((v) => {
                if(v.group == operation.param1) {
                    return v
                }
            })
            if(this.checkReader.length < 1 || idx == -1) {
                this.checkReader.push({ group: operation.param1, users: [operation.param2], timeSeen: [operation.param3] });
            } else {
                for (var i = 0; i < this.checkReader.length; i++) {
                    if(this.checkReader[i].group == operation.param1) {
                        if(!this.checkReader[i].users.includes(operation.param2)) {
                            this.checkReader[i].users.push(operation.param2);
                            this.checkReader[i].timeSeen.push(operation.param3);
                        }
                    }
                }
            }
        }

        if(operation.type == 13) { // diinvite
            if(isAdminOrBot(operation.param2)) {
                return this._acceptGroupInvitation(operation.param1);
            } else {
                return this._cancel(operation.param1,myBot);
            }
        }
        this.getOprationType(operation);
    }

    async cancelAll(gid) {
        let { listPendingInvite } = await this.searchGroup(gid);
        if(listPendingInvite.length > 0){
            this._cancel(gid,listPendingInvite);
        }
    }

    async searchGroup(gid) {
        let listPendingInvite = [];
        let thisgroup = await this._getGroups([gid]);
        if(thisgroup[0].invitee !== null) {
            listPendingInvite = thisgroup[0].invitee.map((key) => {
                return key.mid;
            });
        }
        let listMember = thisgroup[0].members.map((key) => {
            return { mid: key.mid, dn: key.displayName };
        });

        return { 
            listMember,
            listPendingInvite
        }
    }
	
	async matchPeople(param, nama) {
	    for (var i = 0; i < param.length; i++) {
            let orangnya = await this._client.getContacts([param[i]]);
		    if(orangnya[0].displayName == nama){
			    return orangnya;
				break;
		    }
        }
	}
	
	async isInGroup(param, mid) {
		let { listMember } = await this.searchGroup(param);
	    for (var i = 0; i < listMember.length; i++) {
		    if(listMember[i].mid == mid){
			    return listMember[i].mid;
				break;
		    }
        }
	}

	
	async searchRoom(rid) {
        let thisroom = await this._getRoom(rid);
        let listMemberr = thisroom.contacts.map((key) => {
            return { mid: key.mid, dn: key.displayName };
        });

        return { 
            listMemberr
        }
    }

    setState(seq,param) {
		if(param == 1){
			let isinya = "Setting\n";
			for (var k in this.stateStatus){
                if (typeof this.stateStatus[k] !== 'function') {
					if(this.stateStatus[k]==1){
						isinya += " "+firstToUpperCase(k)+" => on\n";
					}else{
						isinya += " "+firstToUpperCase(k)+" => off\n";
					}
                }
            }this._sendMessage(seq,isinya);
		}else{
        if(isAdminOrBot(seq.from_)){
            let [ actions , status ] = seq.text.split(' ');
            const action = actions.toLowerCase();
            const state = status.toLowerCase() == 'on' ? 1 : 0;
            this.stateStatus[action] = state;
			let isinya = "Setting\n";
			for (var k in this.stateStatus){
                if (typeof this.stateStatus[k] !== 'function') {
					if(this.stateStatus[k]==1){
						isinya += " "+firstToUpperCase(k)+" => on\n";
					}else{
						isinya += " "+firstToUpperCase(k)+" => off\n";
					}
                }
            }
            //this._sendMessage(seq,`Status: \n${JSON.stringify(this.stateStatus)}`);
			this._sendMessage(seq,isinya);
        } else {
            this._sendMessage(seq,`Not permitted!`);
        }}
    }

    mention(listMember) {
        let mentionStrings = [''];
        let mid = [''];
        for (var i = 0; i < listMember.length; i++) {
            mentionStrings.push('@'+listMember[i].displayName+'\n');
            mid.push(listMember[i].mid);
        }
        let strings = mentionStrings.join('');
        let member = strings.split('@').slice(1);
        
        let tmp = 0;
        let memberStart = [];
        let mentionMember = member.map((v,k) => {
            let z = tmp += v.length + 1;
            let end = z - 1;
            memberStart.push(end);
            let mentionz = `{"S":"${(isNaN(memberStart[k - 1] + 1) ? 0 : memberStart[k - 1] + 1 ) }","E":"${end}","M":"${mid[k + 1]}"}`;
            return mentionz;
        })
        return {
            names: mentionStrings.slice(1),
            cmddata: { MENTION: `{"MENTIONEES":[${mentionMember}]}` }
        }
    }
	
	async tagAlls(seq){
		let { listMember } = await this.searchGroup(seq.to);
			seq.text = "";
			let mentionMemberx = [];
            for (var i = 0; i < listMember.length; i++) {
				if(seq.text == null || typeof seq.text === "undefined" || !seq.text){
					let namanya = listMember[i].dn;
				    let midnya = listMember[i].mid;
				    seq.text += "@"+namanya+" \n";
                    let member = [namanya];
        
                    let tmp = 0;
                    let mentionMember1 = member.map((v,k) => {
                        let z = tmp += v.length + 3;
                        let end = z;
                        let mentionz = `{"S":"0","E":"${end}","M":"${midnya}"}`;
                        return mentionz;
                    })
					mentionMemberx.push(mentionMember1);
				    //const tag = {cmddata: { MENTION: `{"MENTIONEES":[${mentionMember}]}` }}
				    //seq.contentMetadata = tag.cmddata;
				    //this._client.sendMessage(0, seq);
				}else{
				    let namanya = listMember[i].dn;
				    let midnya = listMember[i].mid;
					let kata = seq.text.split("");
					let panjang = kata.length;
				    seq.text += "@"+namanya+" \n";
                    let member = [namanya];
        
                    let tmp = 0;
                    let mentionMember = member.map((v,k) => {
                        let z = tmp += v.length + 3;
                        let end = z + panjang;
                        let mentionz = `{"S":"${panjang}","E":"${end}","M":"${midnya}"}`;
                        return mentionz;
                    })
					mentionMemberx.push(mentionMember);
				}
			}
			
			const tag = {cmddata: { MENTION: `{"MENTIONEES":[${mentionMemberx}]}` }}
			seq.contentMetadata = tag.cmddata;
			this._client.sendMessage(0, seq);
	}
	
	async textMessage(textMessages,seq)
			{
			  const [cmd,payload] = textMessages.split('');
			  const txt = textMessages.toLowerCase();
			  const messageID = seq.id;
			
	       var ginfo = await this._getGroup(seq,to);
	     }
	
	mension(listMember) {
        let mentionStrings = [''];
        let mid = [''];
        mentionStrings.push('@'+listMember.displayName+'\n');
        mid.push(listMember.mid);
        let strings = mentionStrings.join('');
        let member = strings.split('@').slice(1);
        
        let tmp = 0;
        let memberStart = [];
        let mentionMember = member.map((v,k) => {
            let z = tmp += v.length + 1;
            let end = z - 1;
            memberStart.push(end);
            let mentionz = `{"S":"${(isNaN(memberStart[k - 1] + 1) ? 0 : memberStart[k - 1] + 1 ) }","E":"${end}","M":"${mid[k + 1]}"}`;
            return mentionz;
        })
        return {
            names: mentionStrings.slice(1),
            cmddata: { MENTION: `{"MENTIONEES":[${mentionMember}]}` }
        }
    }

    async recheck(cs,group) {
        let users;
        for (var i = 0; i < cs.length; i++) {
            if(cs[i].group == group) {
                users = cs[i].users;
            }
        }
        
        let contactMember = await this._getContacts(users);
        return contactMember.map((z) => {
                return { displayName: z.displayName, mid: z.mid };
            });
    }
	
	async leftGroupByName(payload) {
        let groupID = await this._getGroupsJoined();
	    for(var i = 0; i < groupID.length; i++){
		    let groups = await this._getGroups(groupID);
            for(var ix = 0; ix < groups.length; ix++){
                if(groups[ix].name == payload){
                    this._client.leaveGroup(0,groups[ix].id);
				    break;
                }
            }
	    }
    }

    removeReaderByGroup(groupID) {
        const groupIndex = this.checkReader.findIndex(v => {
            if(v.group == groupID) {
                return v
            }
        })

        if(groupIndex != -1) {
            this.checkReader.splice(groupIndex,1);
        }
    }

    async textMessage(textMessages, seq, param, lockt) {
        //const [ cmd, payload ] = textMessages.split(' ');
		const gTicket = textMessages.split('line://ti/g/');
        const txt = textMessages.toLowerCase();
        const messageID = seq.id;
		const cot = textMessages.split('@');
		const com = textMessages.split(':');
		const cox = textMessages.split(' ');

		if(vx[1] == "sendcontact" && seq.from_ == vx[0] && waitMsg == "yes"){
			let panjang = txt.split("");
			if(txt == "cancel"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"# CANCELLED");
			}else if(txt == "me"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				seq.text = "Me";seq.contentType = 13;
				seq.contentMetadata = { mid: seq.from_ };
				this._client.sendMessage(0, seq);
			}else if(cot[1]){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				let ment = seq.contentMetadata.MENTION;
			    let xment = JSON.parse(ment);let pment = xment.MENTIONEES[0].M;
				seq.text = "Me";seq.contentType = 13;
				seq.contentMetadata = { mid: pment };
				this._client.sendMessage(0, seq);
			}else if(vx[2] == "arg1" && panjang.length > 30 && panjang[0] == "u"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				seq.text = "Me";seq.contentType = 13;
				seq.contentMetadata = { mid: txt };
				this._client.sendMessage(0, seq);
			}else{
				this._sendMessage(seq,"Tag orangnya atau kirim midnya bang !");
			}
		}
		if(txt == "sendcontact" && !isBanned(banList, seq.from_)){
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
			    waitMsg = "yes";
			    vx[0] = seq.from_;vx[1] = txt;vx[2] = "arg1";
			    this._sendMessage(seq,"Kontaknya siapa bang ? #Tag orangnya atau kirim midnya");
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else if(txt == 'sendcontact' && isBanned(banList, seq.from_)){this._sendMessage(seq,"Not permitted !");}
		
		if(vx[1] == "addcontact" && seq.from_ == vx[0] && waitMsg == "yes"){
			let panjang = txt.split("");
			if(txt == "cancel"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"# CANCELLED");
			}else if(seq.contentType == 13){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				let midnya = seq.contentMetadata.mid;
				let listContacts = await this._client.getAllContactIds();
				for(var i = 0; i < listContacts.length; i++){
					if(listContacts[i] == midnya){
						vx[4] = "sudah";
						break;
					}
				}
				let bang = new Message();
				bang.to = seq.to;
				if(vx[4] == "sudah"){
					bang.text = "Dia sudah masuk friendlist bang, gk bisa ku add lagi !";
					this._client.sendMessage(0, bang);
				}else{
				    bang.text = "Ok bang !, Sudah ku add !";
				    await this._client.findAndAddContactsByMid(seq, midnya);
				    this._client.sendMessage(0, bang);
				}vx[4] = "";
			}else if(cot[1]){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				let ment = seq.contentMetadata.MENTION;
			    let xment = JSON.parse(ment);let pment = xment.MENTIONEES[0].M;let midnya = pment;
				let listContacts = await this._client.getAllContactIds();
				for(var i = 0; i < listContacts.length; i++){
					if(listContacts[i] == midnya){
						vx[4] = "sudah";
						break;
					}
				}
				let bang = new Message();
				bang.to = seq.to;
				if(vx[4] == "sudah"){
					bang.text = "Dia sudah masuk friendlist bang, gk bisa ku add lagi !";
					this._client.sendMessage(0, bang);
				}else{
				    bang.text = "Ok bang !, Sudah ku add !";
				    await this._client.findAndAddContactsByMid(seq, midnya);
				    this._client.sendMessage(0, bang);
				}vx[4] = "";
			}else if(vx[2] == "arg1" && panjang.length > 30 && panjang[0] == "u"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				let midnya = txt;
				let listContacts = await this._client.getAllContactIds();
				for(var i = 0; i < listContacts.length; i++){
					if(listContacts[i] == midnya){
						vx[4] = "sudah";
						break;
					}
				}
				let bang = new Message();
				bang.to = seq.to;
				if(vx[4] == "sudah"){
					bang.text = "Dia sudah masuk friendlist bang, gk bisa ku add lagi !";
					this._client.sendMessage(0, bang);
				}else{
				    bang.text = "Ok bang !, Sudah ku add !";
				    await this._client.findAndAddContactsByMid(seq, midnya);
				    this._client.sendMessage(0, bang);
				}vx[4] = "";
			}else{
				this._sendMessage(seq,"Cara !addcontact :\n-Kirim Contact Orang Yang Mau Di Add\n-Kirim Mid Orang Yang Mau Di Add\n-Atau Tag Orang Yang Mau Di Add");
			}
		}
		if(txt == "addcontact" && isAdminOrBot(seq.from_)){
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
			    waitMsg = "yes";
			    vx[0] = seq.from_;vx[1] = txt;vx[2] = "arg1";
			    this._sendMessage(seq,"Kontaknya siapa bang ? #Tag orangnya atau kirim midnya");
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else if(txt == '!addcontact' && !isAdminOrBot(seq.from_)){this._sendMessage(seq,"Not permitted !");}
		
		if(vx[1] == "checkid" && seq.from_ == vx[0] && waitMsg == "yes"){
			let panjang = txt.split("");
			if(txt == "cancel"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"# CANCELLED");
			}else if(txt == "me"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				seq.text = seq.from_;
				this._client.sendMessage(0, seq);
			}else if(cot[1]){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				let cekid = new Message();
				cekid.to = seq.to;
				let ment = seq.contentMetadata.MENTION;
			    let xment = JSON.parse(ment);let pment = xment.MENTIONEES[0].M;
				
				cekid.text = JSON.stringify(pment);
				this._client.sendMessage(0, cekid);
			}else{
				this._sendMessage(seq,"Tag orangnya bang !");
			}
		}
		if(txt == "checkid" && !isBanned(banList, seq.from_)){
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
			    waitMsg = "yes";
			    vx[0] = seq.from_;vx[1] = txt;vx[2] = "arg1";
			    this._sendMessage(seq,"Cek ID siapa bang ? #Tag orangnya");
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else if(txt == 'checkid' && isBanned(banList, seq.from_)){this._sendMessage(seq,"Not permitted !");}
		
		if(vx[1] == "stalk" && seq.from_ == vx[0] && waitMsg == "yes"){
			vx[3] = txt;
			console.info(vx[3]);//waitMsg = "no";
			let vvx = vx[1];let vvxx = vx[0];//vx[0] = "";vx[1] = "";
			if(txt == "cancel"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"# CANCELLED");
			}else if(vx[2] == "arg1" && !cox[1]){
				    let orangnya = await this._getContacts([txt]);
				    seq.text = 
"#Nama: "+orangnya[0].displayName+"\n\
#ID: \n"+orangnya[0].mid+"\n\
#Profile Picture: \nhttp://dl.profile.line.naver.jp"+orangnya[0].picturePath+"\n\
#Status: \n"+orangnya[0].statusMessage+"\n\
\n\n\n \n\
====================\n\
              Copyright \n\
====================";
vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				    this._sendMessage(seq,seq.text);
			}
			this._sendMessage(seq,"# "+vvx+" to "+param);
		}
		if(txt == "stalk" && !isBanned(banList, seq.from_)){
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
			    waitMsg = "yes";
			    vx[0] = seq.from_;vx[1] = txt;vx[2] = "arg1";
			    this._sendMessage(seq,"Kepo sama siapa bang ? #kirim midnya");
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else if(txt == 'stalk' && isBanned(banList, seq.from_)){this._sendMessage(seq,"Not permitted !");}
		
		if(vx[1] == "msg" && seq.from_ == vx[0] && waitMsg == "yes"){
			//vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
			let panjang = txt.split("");
			if(txt == "cancel"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}else if(vx[2] == "arg1" && vx[3] == "mid" && panjang.length > 30){
				midnornama = txt;
				this._sendMessage(seq,"OK !, btw pesan-nya apa ?");
				vx[4] = txt;
				vx[2] = "arg2";
			}else if(vx[2] == "arg2" && vx[3] == "mid"){
				let panjang = vx[4].split("");
				let kirim = new Message();let bang = new Message();
				bang.to = seq.to;
				if(panjang[0] == "u"){
					kirim.toType = 0;
				}else if(panjang[0] == "c"){
					kirim.toType = 2;
				}else if(panjang[0] == "r"){
					kirim.toType = 1;
				}else{
					kirim.toType = 0;
				}
				bang.text = "Terkirim bang !";
				kirim.to = midnornama;
				kirim.text = txt;
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._client.sendMessage(0, kirim);
				this._client.sendMessage(0, bang);
			}else if(vx[2] == "arg1" && vx[3] == "nama"){
				let midnornama = seq.contentMetadata.MENTION;//.MENTIONEES.M
				let bang = new Message();
			    bang.to = seq.to;
				bang.text = "OK bos !, btw pesan-nya apa ?";
				this._client.sendMessage(0, bang);
				vx[2] = "arg2";
			}else if(vx[2] == "arg2" && vx[3] == "nama"){
				let pesane = seq.text;
				let bang = new Message();
				bang.to = seq.to;
				bang.text = "Terkirim bos !";
				seq.to = midnornama;
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,pesane);
				this._client.sendMessage(0, bang);
			}
		}
		
		if(txt == "msg" && !isBanned(banList, seq.from_)){
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
			    waitMsg = "yes";
			    vx[0] = seq.from_;vx[1] = txt;vx[3] = "mid";
			    this._sendMessage(seq,"Mau kirim pesan ke siapa bang ?");
				this._sendMessage(seq,"Kirim midnya ya bang ! #jangan pake nama");
				vx[2] = "arg1";
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else if(txt == 'msg' && isBanned(banList, seq.from_)){this._sendMessage(seq,"Not permitted !");}
		
		if(vx[1] == "banned" && seq.from_ == vx[0] && waitMsg == "yes"){
			if(txt == "cancel"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}else if(txt == "me"){
				if(isBanned(banList,seq.from_)){
					waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
					this._sendMessage(seq,"Ente sudah masuk daftar banlist...");
				}else{
				    this._sendMessage(seq,"Sudah bosku !");
			        banList.push(seq.from_);
				    waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				}
			}else{
				if(cot[1]){
					let ment = seq.contentMetadata.MENTION;
			        let xment = JSON.parse(ment);let pment = xment.MENTIONEES[0].M;
					if(isBanned(banList,pment)){
						waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
					    this._sendMessage(seq,cot[1]+" sudah masuk daftar banlist...");
				    }else{
					    this._sendMessage(seq,"Sudah bosku !");
			            banList.push(pment);
					    waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
					}
				}else{
					this._sendMessage(seq,"Tag orang yang mau diban sama abang !");
				}
			}
		}
		if(txt == "banned" && isAdminOrBot(seq.from_)){
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
			    waitMsg = "yes";
			    vx[0] = seq.from_;vx[1] = txt;
			    this._sendMessage(seq,"Ban siapa ?");
				vx[2] = "arg1";
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else if(txt == "banned" && !isAdminOrBot(seq.from_)){this._sendMessage(seq,"Not permitted !");}
		
		if(vx[1] == "unbanned" && seq.from_ == vx[0] && waitMsg == "yes"){
			if(txt == "cancel"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}else{
				if(isBanned(banList, txt)){
					let ment = banList.indexOf(txt);
					if (ment > -1) {
                        banList.splice(ment, 1);
                    }
					waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
					this._sendMessage(seq,"Sudah bosku !");
				}else{
					this._sendMessage(seq,"Dia gk masuk daftar banned bos !");
				}
			}
		}
		if(txt == "unbanned" && isAdminOrBot(seq.from_)){
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
			    waitMsg = "yes";
			    vx[0] = seq.from_;vx[1] = txt;
				seq.text = "";
				for(var i = 0; i < banList.length; i++){
					let orangnya = await this._getContacts([banList[i]]);
				    seq.text += "\n-["+orangnya[0].mid+"]["+orangnya[0].displayName+"]";
				}
				this._sendMessage(seq,seq.text);
			    this._sendMessage(seq,"unban siapa ?");
				vx[2] = "arg1";
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else if(txt == "unbanned" && !isAdminOrBot(seq.from_)){this._sendMessage(seq,"Not permitted !");}
		
		if(txt == "banlist"){
			seq.text = "";
			for(var i = 0; i < banList.length; i++){
			    let orangnya = await this._getContacts([banList[i]]);
				seq.text += "\n["+orangnya[0].mid+"]["+orangnya[0].displayName+"]";
			}
			this._sendMessage(seq,seq.text);
		}
		
		if(txt == "bye bot"){
			this._client.leaveGroup(0,seq.to);
		}
		
		if(vx[1] == "ytools" && seq.from_ == vx[0] && waitMsg == "yes"){
			if(txt == "cancel"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}else if(vx[2] == "arg1"){
				vx[3] = '';vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";
				let dlUrl = textMessages;let tspl = textMessages.split("youtu.be/");
				if(tspl || typeof tspl !== "undefined"){
					dlUrl = "https://m.youtube.com/watch?v="+tspl[1];
				}
				let downloader = this.config.YT_DL;let hasil = '';
				let infDl = new Message();
				infDl.to = seq.to;
				var options = {
             	   uri: downloader,
             	   qs: {url: dlUrl},
            	   json: true // Automatically parses the JSON string in the response
            	};

            	await rp(options)
           	  	  .then(function (repos) {
           	          hasil = repos;
            	})
             	  .catch(function (err) {
                      console.info(err);
           	    });
				if(hasil == "Error: no_media_found"){
			    	infDl.text = "Gagal bang !, mungkin url-nya salah...";
				}else{
					let title = hasil.title;
					let urls = hasil.urls;
					infDl.text = "[ Youtube Downloader ]\nTitle: "+title+"\n";
					for(var i = 0; i < urls.length; i++){
						let idU = await this.gooGl(urls[i].id);
						infDl.text += "\n\
Info: "+urls[i].label+"\n\
Link Download: "+idU.id+"\n";
					}
				}
				this._sendMessage(seq,infDl.text);
			}
		}
		if(txt == "ytools" && !isBanned(seq.from_)){
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
				waitMsg = "yes";
			    vx[0] = seq.from_;vx[1] = txt;
			    this._sendMessage(seq,"Mau download video youtube bang ? OK, kirim link youtubenya !");
				vx[2] = "arg1";
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else if(txt == "ytools" && isBanned(seq.from_)){this._sendMessage(seq,"Not permitted !");}
		
		if(vx[1] == "bye bot" && seq.from_ == vx[0] && waitMsg == "yes"){
			if(txt == "cancel"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}else if(txt == "group" && vx[2] == "arg1"){
				vx[3] = txt;
				this._sendMessage(seq,"OK, Apa nama groupnya bang ?");
				vx[2] = "arg2";
			}else if(vx[3] == "group" && vx[2] == "arg2"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this.leftGroupByName(textMessages);
			}
		}
		if(txt == "bye bot" && isAdminOrBot(seq.from_)){
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
				waitMsg = "yes";
			    vx[0] = seq.from_;vx[1] = txt;
			    this._sendMessage(seq,"Left dari ? #group");
				vx[2] = "arg1";
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else if(txt == "bye bot" && !isAdminOrBot(seq.from_)){this._sendMessage(seq,"Not permitted !");}
		
		if(txt == "bot:off" && isAdminOrBot(seq.from_)){
			this.stateStatus.mute = 1;
			this._sendMessage(seq,"Shutdown")
		}

        if(txt == 'sudo cancel' && this.stateStatus.cancel == 1 && isAdminOrBot(seq.from_)) {
            this.cancelAll(seq.to);
        }else if(txt == "!cancel" && !isAdminOrBot(seq.from_)){this._sendMessage(seq,"Not permitted !");}

        if(txt == 'respon') {
			let { mid, displayName } = await this._client.getProfile();
            this._sendMessage(seq, 'Iam Here '+displayName);
        }
		
		if(txt == "kickme!" && seq.toType == 2 && !isBanned(banList, seq.from_)){
			this._sendMessage(seq,"Ok bang !");
			this._kickMember(seq.to,[seq.from_]);
		}else if(txt == 'kickme!' && isBanned(banList, seq.from_)){this._sendMessage(seq,"Not permitted !");}

        if(txt == 'speed' && !isBanned(banList, seq.from_)) {
            const curTime = Math.floor(Date.now() / 1000);
            const rtime = Math.floor(Date.now() / 1000) - curTime;
            this._sendMessage(seq, `${rtime} second`);
        }else if(txt == 'speed' && isBanned(banList, seq.from_)){this._sendMessage(seq,"Not permitted !");}

        if(txt === 'sudo kickall' && this.stateStatus.kick == 1 && isAdminOrBot(seq.from_) && seq.toType == 2) {
            let { listMember } = await this.searchGroup(seq.to);
            for (var i = 0; i < listMember.length; i++) {
                if(!isAdminOrBot(listMember[i].mid)){
                    this._kickMember(seq.to,[listMember[i].mid])
                }
            }
        }else if(txt === 'sudo kickall' && !isAdminOrBot(seq.from_) && seq.toType == 2){this._sendMessage(seq,"Not permitted !");}
		
		if(txt == 'help') {
			let botOwner = await this._client.getContacts([myBot[0]]);
            let { mid, displayName } = await this._client.getProfile();
			let key2 = "\n\
======================\n\
| BotName   : "+displayName+"\n\
| BotID     : \n["+mid+"]\n\
| BotStatus : Working\n\
| BotRank  : AdminBot\n\
======================\n";
			seq.text = key2 += this.keyhelp;
			this._client.sendMessage(0, seq);
		}
		
		if(txt == '0101' && lockt == 1) {//Jangan dicoba (gk ada efek)
            let { listMember } = await this.searchGroup(seq.to);
            for (var i = 0; i < listMember.length; i++) {
                if(listMember[i].mid==param){
					let namanya = listMember[i].dn;
					seq.text = 'Halo @'+namanya+', Selamat datang bro ! Salam Kenal ^_^';
					let midnya = listMember[i].mid;
					let kata = seq.text.split("@").slice(0,1);
					let kata2 = kata[0].split("");
					let panjang = kata2.length;
                    let member = [namanya];
        
                    let tmp = 0;
                    let mentionMember = member.map((v,k) => {
                        let z = tmp += v.length + 1;
                        let end = z + panjang;
                        let mentionz = `{"S":"${panjang}","E":"${end}","M":"${midnya}"}`;
                        return mentionz;
                    })
					const tag = {cmddata: { MENTION: `{"MENTIONEES":[${mentionMember}]}` }}
					seq.contentMetadata = tag.cmddata;
					this._client.sendMessage(0, seq);
					//console.info("Salam");
                }
            }
        }
		
		if(txt == 'tagall' && isAdminOrBot(seq.from_)){
       let { listMember } = await this.searchGroup(seq.to);
            const mentions = await this.mention(listMember);
            seq.contentMetadata = mentions.cmddata;
            await this._sendMessage(seq,mentions.names.join(''));
     }
		
		if(txt == '0103' && lockt == 1){
			let ax = await this._client.getGroup(seq.to);
			if(ax.preventJoinByTicket === true){}else{ax.preventJoinByTicket = true;await this._client.updateGroup(0, ax);}
		}
		if(txt == '0104' && lockt == 1){
			let ax = await this._client.getGroup(seq.to);
			if(ax.preventJoinByTicket === true){ax.preventJoinByTicket = false;await this._client.updateGroup(0, ax);}else{}
		}
		
		if(txt == '0102' && lockt == 1) {//Jangan dicoba (gk ada efek)
            let { listMember } = await this.searchGroup(seq.to);
            for (var i = 0; i < listMember.length; i++) {
                if(listMember[i].mid==param){
					let namanya = listMember[i].dn;
					seq.text = 'Goodbye ! @'+namanya;
					let midnya = listMember[i].mid;
					let kata = seq.text.split("@").slice(0,1);
					let kata2 = kata[0].split("");
					let panjang = kata2.length;
                    let member = [namanya];
        
                    let tmp = 0;
                    let mentionMember = member.map((v,k) => {
                        let z = tmp += v.length + 1;
                        let end = z + panjang;
                        let mentionz = `{"S":"${panjang}","E":"${end}","M":"${midnya}"}`;
                        return mentionz;
                    })
					const tag = {cmddata: { MENTION: `{"MENTIONEES":[${mentionMember}]}` }}
					seq.contentMetadata = tag.cmddata;
					this._client.sendMessage(0, seq);
					//console.info("Salam");
                }
            }
        }

        if(txt == 'setlastpoint') {
            this.checkReader = []
            this._sendMessage(seq, `Find Silent Reader`);
            this.removeReaderByGroup(seq.to);
        }

        /*if(txt == 'clearpoint') {
            this.checkReader = []
            this._sendMessage(seq, `Remove all check reader on memory`);
        }*/  

        if(txt == 'viewlastseen'){
            let rec = await this.recheck(this.checkReader,seq.to);
            const mentions = await this.mention(rec);
            seq.contentMetadata = mentions.cmddata;
            await this._sendMessage(seq,mentions.names.join(''));
            
        }

        if(txt == 'setpoint for check reader .') {
            this.searchReader(seq);
        }

        /*if(txt == 'clearall') {
            this.checkReader = [];
        }*/
		
		if(txt == "kickbanned" && isAdminOrBot(seq.from_)){
			for(var i = 0; i < banList.length; i++){
				let adaGk = await this.isInGroup(seq.to, banList[i]);
				if(typeof adaGk !== "undefined" && adaGk){
					this._kickMember(seq.to,adaGk);
				}
			}
		}else if(txt == "kickbanned" && !isBanned(seq.from_)){this._sendMessage(seq,"Not permitted !");}
		
		if(txt == "setting"){
			this.setState(seq,1)
		}
		
        const action = ['cancel on','cancel off','kick on','kick off','salam on','salam off','protect off','protect on','qr on','qr off']
        if(action.includes(txt)) {
            this.setState(seq,0)
        }
	
        if(txt == 'myid' || txt == 'mid' || txt == 'id') {
          /* seq.contentType=13;
            seq.contentMetadata = { mid: seq.from };
            this._client.sendMessage(1, seq);
        }else{*/
            this._sendMessage(seq,"ID Kamu: "+seq.from_);
        }

        const joinByUrl = ['ourl','curl'];
        if(joinByUrl.includes(txt)) {
            this._sendMessage(seq,`Updating group ...`);
            let updateGroup = await this._getGroup(seq.to);
            updateGroup.preventJoinByTicket = true;
            if(txt == 'ourl') {
                updateGroup.preventJoinByTicket = false;
                const groupUrl = await this._reissueGroupTicket(seq.to)
                this._sendMessage(seq,`Line group = line://ti/g/${groupUrl}`);
            }
            await this._updateGroup(updateGroup);
        }
        
		var protect_qr = await this._getGroup(seq.to);
		
		if(protect_qr.preventJoinByTicket == false && !isAdminOrBot(seq.from))
		{
   	  this._kickMember(seq.to, seq.from);
   	  protect_qr.preventJoinByTicket = true;
   	  await this._updateGroup(protect_qr);
   	}
		
		if(txt == "0105" && lockt == 1){
			let aas = new Message();
			aas.to = param;
			let updateGroup = await this._getGroup(seq.to);
            if(updateGroup.preventJoinByTicket === true) {
                updateGroup.preventJoinByTicket = false;
				await this._updateGroup(updateGroup);
            }
			const groupUrl = await this._reissueGroupTicket(seq.to);
			aas.toType = 0;
			aas.text = `!joinline://ti/g/${groupUrl}`;
			this._client.sendMessage(0, aas);
		}
		
		/*if (txt == 'group:creator')
{
    let gcreator = await this._getGroup(seq.to);
    seq.contentType = 13;
    Seq.contentMetadata = {mid: gcreator.creator.mid, displayName: gcreator.creator.displayName};
    this._client.sendMessage(1, seq);
}*/
		
		if(cox[0] == "broadcast" && isAdminOrBot(seq.from_)){
    let listMID = [];
    let bcText = textMessages.split(" ").slice(1).toString().replace(/,/g , " ");
    let bcm = new Message();
    bcm.toType = 0;
    let listContact = await this._client.getAllContactIds();listMID.push(listContact);
	let listGroup = await this._client.getGroupIdsJoined();listMID.push(listGroup);
    for(var i = 0; i < listMID.length; i++){
		for(var xi = 0; xi <listMID[i].length; xi++){
			bcm.to = listMID[i][xi];
            let midc = listMID[i][xi].split("");
            if(midc[0] == "u"){bcm.toType = 0;}else if(midc[0] == "c"){bcm.toType = 2;}else if(midc[0] == "r"){bcm.toType = 1;}else{bcm.toType = 0;}
            bcm.text = bcText;
            this._client.sendMessage(0, bcm);
		}
    }
}
     var ginfo = await this._getGroup(seq,to);
     
     if(txt == 'bot creator') {
        	seq.contentType=13;
            seq.contentMetadata = { mid: 'u446b4e563274a6949a33870ce9c31ede' };
            this._client.sendMessage(1, seq);
     }
     
     if(txt === 'kernel') {
       exec('uname -a;ptime;id;whoami',(err,sto) => {
         this._sendMessage(seq,sto);
       })
     }
     
     if(txt == 'haha' || txt == 'hahaha') {
       seq,contentType = 7
       seq,contentMetadata = {'STKID': '110','STKPKGID': '1','STKVER': '100'};
       this._client.sendMessage(1, seq);
     }
            
     /*if(txt == 'gift') {
        this.messages.contentType = 9
        this.messages.contentMetadata = {'PRDID': 'a0768339-c2d3-4189-9653-2909e9bb6f58','PRDTYPE': 'THEME','MSGTPL': 
        this._client.sendMessage(1, this.messages)
    }*/
		if(gTicket[0] == "join" && isAdminOrBot(seq.from_)){
			let sudah = "no";
			let { id } = await this._findGroupByTicket(gTicket[1]);
			let lGroup = await this._client.getGroupIdsJoined();
			for(var i = 0; i < lGroup.length; i++){
				if(id == lGroup){
					sudah = "ya";break;
				}
			}
			if(sudah == "ya"){
				this._sendMessage(seq, "Gagal join bang, mungkin eneng udah masuk groupnya");
			}else{
				await this._acceptGroupInvitationByTicket(id,gTicket[1]);
			}
		}
    }
}

module.exports = new LINE();