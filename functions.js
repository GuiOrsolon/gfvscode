"use strict"
const vscode = require('vscode');
const pr     = require('properties-reader');
const path   = require('path');
const cp     = require('child_process');
const fs     = require('fs');
const os     = require('os');

//Import constants of extension

const cts    = require('./constants');

//VSCode Interface Components

let grailsChannel    = vscode.window.createOutputChannel(`Grails`);
let statusBarItem    = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
let stbarConfig      = [];

//Global Variables

let applicationName  = '';
let grailsVersion    = '';

//Filters and Catchers

let outputFilter     = '';
let infoCatcher      = '';
let createCatcher    = '';
let urlCatcher       = '';
let stopCatcher      = '';

//Configuration Variables

let nameProxy        = '';
let hostProxy        = '';
let portProxy        = '';
let usernameProxy    = '';
let passwordProxy    = '';
let proxyCommand     = '';

//Helper functions

function showGrailsChannel() {
  grailsChannel.show();
}

function getWorkspaceDir(){
  return path.resolve(vscode.workspace.workspaceFolders[0].uri.fsPath);
}

function checkIfIsAGrailsProject(){
  if(fs.existsSync(path.join(getWorkspaceDir(),'grailsw')))
    return true;
  else
    return false;
}

function defineAppProperties(){
  let properties  = pr(path.join(getWorkspaceDir(),'application.properties'));
  grailsVersion   = properties.get("app.grails.version");
  applicationName = properties.get("app.name");
  vscode.window.showInformationMessage(`Grails Version Project detected: ${grailsVersion}`);
}

function getGrailsVersion(){
  return grailsVersion;
}

function setStatusBarItem(status){
  if(status != 'dispose'){
    if     (status == 'create')   stbarConfig = ['Creating Grails App...','#ffffff'];
    else if(status == 'done')     stbarConfig = ['Grails Done...', '#ffffff'];
    else if(status == 'init')     stbarConfig = ['Performing Grails Application Init...','#ffffff'];
    else if(status == 'running')  stbarConfig = ['Grails Application Running...','#3bad3d'];
    else if(status == 'stopping') stbarConfig = ['Stopping Application...','#bd2438'];
    else if(status == 'stopped')  stbarConfig = ['Grails Application Stopped...','#ffffff'];
    statusBarItem.text  = stbarConfig[0];
    statusBarItem.color = stbarConfig[1];
    statusBarItem.show();
  }else{
    statusBarItem.hide();
  }
}

function getFileListFolder(typeFiles){
  let directory = '';
  let fileList = [];
  directory = path.join(getWorkspaceDir(),`grails-app/${typeFiles}/${applicationName}`);
  fs.readdir(directory, (err, files) =>{
    files.forEach(file =>{
      fileList.append(file.match(/[^.groovy\n]+/gi));
    });
  });
  return fileList;
}

function filterVersion(version, resource){
  let result;
  if(resource == 'create-filter'){
    if(parseInt(version[0]) > 3){
      result = false;
    }else{
      result = true;
    }
  }else if(resource == 'create-interceptor'){
    if(parseInt(version[0] > 3)){
      result = true;
    }else{
      result = false;
    }
  }else if(resource == 'add-proxy'){
    if(parseInt(version[0]) > 3){
      result = false;
    }else{
      result = true;
    }
  }else if(resource == 'clear-proxy'){
    if(parseInt(version[0]) > 3){
      result = false;
    }else{
      result = true;
    }
  }else if(resource == 'remove-proxy'){
    if(parseInt(version[0] > 3)){
      result = false;
    }else{
      result = true;
    }
  }
  return result;
}

//Development functions

function runApp(){
  defineAppProperties();
  setStatusBarItem('init');
  grailsChannel.show();
  let promise = new Promise(resolve =>{
    vscode.window.showInformationMessage(`Running App '${applicationName}'...`);
    let result = cp.exec(`grails run-app`, {cwd: getWorkspaceDir()});
    result.stdout.on("data", (data)=>{
      outputFilter = data;
      infoCatcher  = outputFilter.match(/\w.+/gi);
      urlCatcher   = outputFilter.match(/(http|https)?:\/\/.+/gi);
      if(infoCatcher != null){
        grailsChannel.append(`${infoCatcher[0]}\n`);
        if(urlCatcher != null){
          setStatusBarItem('running');
          vscode.env.openExternal(vscode.Uri.parse(urlCatcher[0]));
        }
      }
      resolve();
    });
  });
  return promise;
}

function stopApp(){
  defineAppProperties();
  setStatusBarItem('stopping');
  grailsChannel.show();
  let promise = new Promise(resolve =>{
    vscode.window.showInformationMessage(`Stopping App '${applicationName}'...`);
    let result = cp.exec(`grails stop-app`, {cwd: getWorkspaceDir()});
    result.stdout.on("data", (data)=>{
      outputFilter = data;
      infoCatcher  = outputFilter.match(/\w.+/gi);
      stopCatcher  = outputFilter.match(/Server Stopped/gi);
      if(infoCatcher != null){
        grailsChannel.append(`${infoCatcher[0]}\n`);
        if(stopCatcher != null){
          setStatusBarItem('stopped');
          vscode.window.showInformationMessage(`Grails Application '${applicationName}' was stopped.`);
        }
      }
      resolve();
    });
  });
  return promise;
}

//Configuration functios

async function addProxy(proxyWithUser){
  if(!filterVersion(getGrailsVersion(),'add-proxy')){
    vscode.window.showErrorMessage(`The 'add-proxy' method is deprecated.`);
  }else{
    nameProxy = await vscode.window.showInputBox(cts.optInputNameProxy);
    if (nameProxy != null && nameProxy.length > 0){
      hostProxy = await vscode.window.showInputBox(cts.optInputHostProxy);
      if(hostProxy != null && hostProxy.length > 0){
        portProxy = await vscode.window.showInputBox(cts.optInputPortProxy);
        if(portProxy != null && portProxy.length > 0){
          if(!isNaN(portProxy)){
            if(proxyWithUser){
              do
                usernameProxy = await vscode.window.showInputBox(cts.optInputUsernameProxy);
              while(usernameProxy == null && usernameProxy.length <= 0);
  
              do
                passwordProxy = await vscode.window.showInputBox(cts.optInputPasswordProxy);
              while(passwordProxy == null && passwordProxy.length <= 0);
            }
          }else{
            vscode.window.showErrorMessage(`The port of proxy configuration is not a number.`);
            return;
          }
        }else{
          vscode.window.showErrorMessage(`The port of proxy configuration required.`);
          return;
        }
      }else{
        vscode.window.showErrorMessage(`The hostname of proxy configuration required.`);
        return;
      }
    }else{
      vscode.window.showErrorMessage(`The name of proxy configuration required.`);
      return;
    }

    proxyCommand = `grails add-proxy ${nameProxy} --host=${hostProxy} --port=${portProxy}`;

    if(proxyWithUser){
      proxyCommand = proxyCommand.concat(` --username=${usernameProxy} --password=${passwordProxy}`);
    }

    console.log(proxyCommand);
    grailsChannel.show();
    let promise = new Promise(resolve =>{
      let result = cp.exec(proxyCommand, {cwd: getWorkspaceDir()});
      result.stdout.on("data",(data)=>{
        outputFilter = data;
        infoCatcher  = outputFilter.match(/\w.+/gi);
      });
      resolve();
    });
    return promise;
  }
}

function clearProxy(){
  if(!filterVersion(getGrailsVersion(),'clear-proxy')){
    vscode.window.showErrorMessage(`The 'clear-proxy' method is deprecated.`);
  }else{
    grailsChannel.show();
    let promise = new Promise(resolve =>{
      let result = cp.exec(`grails clear-proxy`,{cwd: getWorkspaceDir()});
      result.stdout.on("data", (data)=>{
        outputFilter = data;
        infoCatcher  = outputFilter.match(/\w.+/gi);
      });
      resolve();
    });
    return promise;
  }
}

async function removeProxy(){
  if(!filterVersion(getGrailsVersion(),'remove-proxy')){
    vscode.window.showErrorMessage(`The 'remove-proxy' method is deprecated.`);
  }else{
    let file = path.join(`${os.homedir()}/.grails`,'ProxySettings.groovy');
    let data = fs.readFileSync(file,'utf-8');
    let lines = data.split(/\r?\n/);
    let proxyNamesCatcher;
    let proxyNamesList = [];
    lines.forEach((line, i) =>{
      if(line.length > 0){
        proxyNamesCatcher = line.match(/(^\w+)/gi);
        proxyNamesList.push(proxyNamesCatcher);
      }
    });
    let quickPick = await vscode.window.showQuickPick(proxyNamesList.toString().split(','),{
      placeHolder: "Teste",
    });
    if(quickPick != null && quickPick.length > 0){
      grailsChannel.show();
      let promise = new Promise(resolve =>{
        vscode.window.showInformationMessage(`Remove '${quickPick}' alias configuration proxy.`);
        let result = cp.exec(`grails remove-proxy ${quickPick}`,{cwd: getWorkspaceDir()});
        result.stdout.on("data", (data) => {
          outputFilter = data;
          infoCatcher  = outputFilter.match(/\w.+/gi);
          if(infoCatcher != null){
            grailsChannel.append(`${infoCatcher[0]}\n`);
          }
          resolve();
        });
      });
      return promise;
    }
  }
}

//Objects Creation Functions

function createApp(){
  vscode.window.showOpenDialog(cts.optCreateApp).then(folder => {
    if(folder != null && folder.length > 0){
      vscode.window.showInputBox(cts.optInputAppName).then(appName =>{
        if(appName != null && appName.length > 0){
          grailsChannel.show();
          let promise = new Promise(resolve => {
            vscode.window.showInformationMessage(`Creating App '${appName}'...`);
            setStatusBarItem('create');
            let result = cp.exec(`grails create-app ${appName}`, {cwd: folder[0].fsPath});
            result.stdout.on("data", (data) => {
              outputFilter  = data;
              infoCatcher   = outputFilter.match(/\w.+/gi);
              createCatcher = outputFilter.match(/Created Grails Application/gi);
              if(infoCatcher != null){
                grailsChannel.append(`${infoCatcher[0]}\n`);
                if(createCatcher != null){
                  let terminal = vscode.window.createTerminal({cwd: folder[0].fsPath});
                  terminal.sendText(`code -r ${appName}`);
                  terminal.dispose;
                  setStatusBarItem('done');
                }
              }
              resolve();
            });
          });
          return promise;
        }
      });
    }
  });
}

function createDomainClass(){
  vscode.window.showInputBox(cts.optInputDomainName).then(domainName =>{
    if(domainName != null && domainName.length > 0){
      grailsChannel.show();
      let promise = new Promise(resolve =>{
        vscode.window.showInformationMessage(`Creating '${domainName}' Domain Class...`);
        let result = cp.exec(`grails create-domain-class ${domainName}`, {cwd: getWorkspaceDir()});
        result.stdout.on("data", (data)=>{
          outputFilter  = data;
          infoCatcher   = outputFilter.match(/\w.+/gi);
          createCatcher = outputFilter.match(/Created file grails-app/gi);
          if(infoCatcher != null){
            grailsChannel.append(`${infoCatcher[0]}\n`);
            if(createCatcher != null){
              vscode.window.showInformationMessage(`Domain Class '${domainName}' was created.`);
            }
          }
          resolve();
        });
      });
      return promise;
    }
  });
}

function createController(){
  vscode.window.showInputBox(cts.optInputControllerName).then(controllerName =>{
    if(controllerName != null && controllerName.length > 0){
      grailsChannel.show();
      let promise = new Promise(resolve =>{
        vscode.window.showInformationMessage(`Creating '${controllerName}' Controller...`);
        let result = cp.exec(`grails create-controller ${controllerName}`, {cwd: getWorkspaceDir()});
        result.stdout.on("data", (data)=>{
          outputFilter  = data;
          infoCatcher   = outputFilter.match(/\w.+/gi);
          createCatcher = outputFilter.match(/Created file grails-app\/controllers/gi);
          if(infoCatcher != null){
            grailsChannel.append(`${infoCatcher[0]}\n`);
            if(createCatcher != null){
              vscode.window.showInformationMessage(`Controller '${controllerName}Controller' was created.`);
            }
          }
          resolve();
        });
      });
      return promise;
    }
  });
}

function createService(){
  vscode.window.showInputBox(cts.optInputServiceName).then(serviceName =>{
    if(serviceName != null && serviceName.length > 0){
      grailsChannel.show();
      let promise = new Promise(resolve =>{
        vscode.window.showInformationMessage(`Creating '${serviceName}' Service...`);
        let result = cp.exec(`grails create-service ${serviceName}`, {cwd: getWorkspaceDir()});
        result.stdout.on("data", (data)=>{
          outputFilter = data;
          infoCatcher  = outputFilter.match(/\w.+/gi);
          createCatcher = outputFilter.match(/Created file grails-app\/services/gi);
          if(infoCatcher != null){
            grailsChannel.append(`${infoCatcher[0]}\n`);
            if(createCatcher != null){
              vscode.window.showInformationMessage(`Service '${serviceName}Service' was created.`);
            }
          }
          resolve();
        });
      });
      return promise;
    }
  });
}

function createFilter(){
  if(!filterVersion(getGrailsVersion(),'create-filter')){
    vscode.window.showErrorMessage(`The 'create-filter' method is deprecated. Use 'create-interceptior'.`);
  }else{
    vscode.window.showInputBox(cts.optInputFilterName).then(filterName =>{
      if(filterName != null && filterName.length > 0){
        grailsChannel.show();
        let promise = new Promise(resolve =>{
          vscode.window.showInformationMessage(`Creating '${filterName}' Filter...`);
          let result = cp.exec(`grails create-filter ${filterName}`,{cwd: getWorkspaceDir()});
          result.stdout.on("data", (data) =>{
            outputFilter = data;
            infoCatcher  = outputFilter.match(/\w.+/gi);
            createCatcher = outputFilter.match(/Created file grails-app\/conf/gi);
            if(infoCatcher != null){
              grailsChannel.append(`${infoCatcher[0]}\n`);
              if(createCatcher != null){
                vscode.window.showInformationMessage(`Filter '${filterName}' was created.`);
              }
            }
            resolve();
          });
        });
        return promise;
      }
    });
  }
}

function createInterceptor(){
  if(!filterVersion(getGrailsVersion(),'create-interceptor')){
    vscode.window.showErrorMessage(`The 'create-interceptor' method not supported in Grails Version < 3. Use 'create-filters'.`);
  }else{
    vscode.window.showInputBox(cts.optInputInterceptorName).then(interceptorName =>{
      if(interceptorName != null && interceptorName.length > 0){
        grailsChannel.show();
        let promise = new Promise(resolve =>{
          vscode.window.showInformationMessage(`Creating '${interceptorName}' Interceptor...`);
          let result = cp.exec(`grails create-interceptor ${interceptorName}`, {cwd: getWorkspaceDir()});
          result.stdout.on("data", (data)=>{
            outputFilter = data;
            infoCatcher  = outputFilter.match(/\w.+/gi);
            //revisar
            createCatcher = outputFilter.match(/Created file grails-app/gi);
            if(infoCatcher != null){
              grailsChannel.append(`${infoCatcher[0]}\n`);
              if(createCatcher != null){
                vscode.window.showInformationMessage(`Interceptor '${interceptorName}' was created.`);
              }
            }
            resolve();
          });
        });
        return promise;
      }
    });
  }
}

function createHibernateCfgXML(){
  let hibernateFile = path.join(getWorkspaceDir(),'grails-app/conf/hibernate/hibernate.cfg.xml');
  if(fs.existsSync(hibernateFile)){
    vscode.window.showWarningMessage(`The file 'hibernate.cfg.xml' already exists. Overwrite it?`, 'Yes', 'No').then(selection =>{
      if(selection === 'Yes'){
        try{
          fs.unlinkSync(hibernateFile);
          grailsChannel.show();
          let promise = new Promise(resolve =>{
            let result = cp.exec(`grails create-hibernate-cfg-xml`,{cwd: getWorkspaceDir()});
            result.stdout.on("data",(data)=>{
              outputFilter     = data;
              infoCatcher      = outputFilter.match(/\w.+/gi);
              createCatcher    = outputFilter.match(/Created file grails-app\\conf\\hibernate\\hibernate.cfg.xml/gi);
              if(infoCatcher != null){
                grailsChannel.append(`${infoCatcher[0]}\n`);
                if(createCatcher != null){
                  vscode.window.showInformationMessage(`The 'hibernate.cfg.xml' file was created.`);
                }
              }
              resolve();
            });
          });
          return promise;
        }catch(err){
          console.error(err);
        }
      }else{
        vscode.window.showInformationMessage(`Operation canceled by user.`);
      }
    });
  }
}

module.exports ={
  showGrailsChannel,
  getWorkspaceDir,
  checkIfIsAGrailsProject,
  defineAppProperties,
  getGrailsVersion,
  setStatusBarItem,
  getFileListFolder,
  filterVersion,
  runApp,
  stopApp,
  addProxy,
  clearProxy,
  removeProxy,
  createApp,  
  createDomainClass,
  createController,
  createService,
  createFilter,
  createInterceptor,
  createHibernateCfgXML
}