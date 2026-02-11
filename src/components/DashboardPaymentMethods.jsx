import React, { useState, useEffect, useCallback } from 'react';

var STORAGE_KEY = 'dayonetools_payment_methods';
var TYPES = [
  { value: 'bank', label: 'Bank Account', color: '#3b82f6' },
  { value: 'paypal', label: 'PayPal', color: '#0070ba' },
  { value: 'crypto', label: 'Crypto', color: '#f7931a' },
  { value: 'custom', label: 'Custom', color: '#8b5cf6' },
];
var CRYPTOS = ['BTC', 'ETH', 'USDT', 'USDC', 'SOL', 'XRP', 'ADA', 'DOGE', 'Other'];

function Modal({ open, onClose, children, title, subtitle }) {
  if (!open) return null;
  return React.createElement('div', {
    style: { position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.6)',padding:'16px' },
    onClick: onClose
  },
    React.createElement('div', {
      style: { background:'#161b22',borderRadius:'10px',border:'1px solid #30363d',width:'100%',maxWidth:'620px',maxHeight:'90vh',overflow:'auto',boxShadow:'0 16px 48px rgba(0,0,0,0.4)' },
      onClick: function(e){e.stopPropagation();}
    },
      React.createElement('div', { style:{padding:'20px 24px 0',display:'flex',justifyContent:'space-between',alignItems:'flex-start'} },
        React.createElement('div', null,
          React.createElement('h2', { style:{fontSize:'18px',fontWeight:'700',color:'#e6edf3',margin:0} }, title),
          subtitle && React.createElement('p', { style:{fontSize:'13px',color:'#8b949e',marginTop:'4px'} }, subtitle)
        ),
        React.createElement('button', { onClick:onClose, style:{background:'none',border:'none',color:'#8b949e',fontSize:'20px',cursor:'pointer',padding:'4px',lineHeight:1} }, '\u2715')
      ),
      React.createElement('div', { style:{padding:'16px 24px 24px'} }, children)
    )
  );
}

function ConfirmDialog({ open, onClose, onConfirm, title, message }) {
  if (!open) return null;
  return React.createElement('div', {
    style:{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:1100,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.6)',padding:'16px'},
    onClick:onClose
  },
    React.createElement('div', {
      style:{background:'#161b22',borderRadius:'10px',border:'1px solid #30363d',padding:'24px',maxWidth:'420px',width:'100%'},
      onClick:function(e){e.stopPropagation();}
    },
      React.createElement('h3', {style:{fontSize:'16px',fontWeight:'700',color:'#e6edf3',margin:'0 0 8px'}}, title),
      React.createElement('p', {style:{fontSize:'14px',color:'#8b949e',marginBottom:'20px',lineHeight:1.5}}, message),
      React.createElement('div', {style:{display:'flex',justifyContent:'flex-end',gap:'8px'}},
        React.createElement('button', {onClick:onClose, style:{padding:'8px 16px',background:'#21262d',border:'1px solid #30363d',borderRadius:'6px',color:'#e6edf3',fontSize:'13px',fontWeight:'500',cursor:'pointer'}}, 'Cancel'),
        React.createElement('button', {onClick:onConfirm, style:{padding:'8px 16px',background:'#ef4444',border:'none',borderRadius:'6px',color:'#fff',fontSize:'13px',fontWeight:'600',cursor:'pointer'}}, 'Delete')
      )
    )
  );
}

export default function DashboardPaymentMethods() {
  var [methods, setMethods] = useState([]);
  var [showModal, setShowModal] = useState(false);
  var [editing, setEditing] = useState(null);
  var [delConfirm, setDelConfirm] = useState(null);
  var [actionsOpen, setActionsOpen] = useState(null);
  var [isMobile, setIsMobile] = useState(false);

  var emptyForm = {
    name:'', type:'bank', active:true, isDefault:false,
    bankName:'', accountName:'', accountNumber:'', swift:'', iban:'', routing:'', sortCode:'', branch:'', address:'',
    paypalEmail:'',
    cryptoCurrency:'BTC', walletAddress:'',
    customFields:[{label:'',value:''}],
  };
  var [form, setForm] = useState(emptyForm);
  var [errors, setErrors] = useState({});

  useEffect(function(){var ck=function(){setIsMobile(window.innerWidth<=768);};ck();window.addEventListener('resize',ck);return function(){window.removeEventListener('resize',ck);};}, []);

  var load = useCallback(function(){
    try{var s=localStorage.getItem(STORAGE_KEY);if(s)setMethods(JSON.parse(s));}catch(e){}
  },[]);
  useEffect(function(){load();},[load]);

  var save = function(data){setMethods(data);localStorage.setItem(STORAGE_KEY,JSON.stringify(data));};

  var getDetails = function(m) {
    if(m.type==='bank') return m.bankName||'';
    if(m.type==='paypal') return m.paypalEmail||'';
    if(m.type==='crypto') return (m.cryptoCurrency||'')+(m.walletAddress?' - '+m.walletAddress.substring(0,12)+'...':'');
    if(m.type==='custom'&&m.customFields&&m.customFields.length>0) return m.customFields.map(function(f){return f.label;}).filter(Boolean).join(', ');
    return '';
  };

  var openCreate = function(){
    setEditing(null);
    setForm(Object.assign({},emptyForm));
    setErrors({});
    setShowModal(true);
  };

  var openEdit = function(m){
    setEditing(m);
    setForm({
      name:m.name||'', type:m.type||'bank', active:m.active!==false, isDefault:!!m.isDefault,
      bankName:m.bankName||'', accountName:m.accountName||'', accountNumber:m.accountNumber||'',
      swift:m.swift||'', iban:m.iban||'', routing:m.routing||'', sortCode:m.sortCode||'', branch:m.branch||'', address:m.address||'',
      paypalEmail:m.paypalEmail||'',
      cryptoCurrency:m.cryptoCurrency||'BTC', walletAddress:m.walletAddress||'',
      customFields:m.customFields&&m.customFields.length>0?m.customFields.map(function(f){return{label:f.label||'',value:f.value||''};}): [{label:'',value:''}],
    });
    setErrors({});
    setActionsOpen(null);
    setShowModal(true);
  };

  var validate = function(){
    var er={};
    if(!form.name.trim()) er.name='Payment method name is required';
    if(form.type==='bank'){
      if(!form.bankName.trim()) er.bankName='Bank name is required';
      if(!form.accountName.trim()) er.accountName='Account name is required';
      if(!form.accountNumber.trim()) er.accountNumber='Account number is required';
    }
    if(form.type==='paypal'){
      if(!form.paypalEmail.trim()) er.paypalEmail='PayPal email is required';
      if(form.paypalEmail&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.paypalEmail)) er.paypalEmail='Invalid email address';
    }
    if(form.type==='crypto'){
      if(!form.walletAddress.trim()) er.walletAddress='Wallet address is required';
    }
    setErrors(er);
    return Object.keys(er).length===0;
  };

  var handleSave = function(){
    if(!validate()) return;
    var data = {
      name:form.name.trim(), type:form.type, active:form.active, isDefault:form.isDefault,
      updatedAt:new Date().toISOString(),
    };
    if(form.type==='bank') Object.assign(data,{bankName:form.bankName.trim(),accountName:form.accountName.trim(),accountNumber:form.accountNumber.trim(),swift:form.swift.trim(),iban:form.iban.trim(),routing:form.routing.trim(),sortCode:form.sortCode.trim(),branch:form.branch.trim(),address:form.address.trim()});
    if(form.type==='paypal') data.paypalEmail=form.paypalEmail.trim();
    if(form.type==='crypto'){data.cryptoCurrency=form.cryptoCurrency;data.walletAddress=form.walletAddress.trim();}
    if(form.type==='custom') data.customFields=form.customFields.filter(function(f){return f.label.trim()||f.value.trim();}).map(function(f){return{label:f.label.trim(),value:f.value.trim()};});

    var updated;
    if(editing){
      updated=methods.map(function(m){return m.id===editing.id?Object.assign({},m,data):m;});
    } else {
      data.id='pm_'+Date.now()+'_'+Math.random().toString(36).substr(2,6);
      data.createdAt=new Date().toISOString();
      updated=methods.concat([data]);
    }
    // Handle default: only one can be default
    if(data.isDefault){
      updated=updated.map(function(m){return m.id===(editing?editing.id:data.id)?m:Object.assign({},m,{isDefault:false});});
    }
    save(updated);
    setShowModal(false);
  };

  var toggleDefault = function(m){
    var updated=methods.map(function(pm){
      if(pm.id===m.id) return Object.assign({},pm,{isDefault:!pm.isDefault});
      return Object.assign({},pm,{isDefault:false});
    });
    save(updated);
    setActionsOpen(null);
  };

  var toggleActive = function(m){
    var updated=methods.map(function(pm){return pm.id===m.id?Object.assign({},pm,{active:!pm.active}):pm;});
    save(updated);
    setActionsOpen(null);
  };

  var confirmDel = function(){
    if(!delConfirm) return;
    save(methods.filter(function(m){return m.id!==delConfirm.id;}));
    setDelConfirm(null);
  };

  var C={bg:'#0d1117',bgCard:'#161b22',bgIn:'#0d1117',text:'#e6edf3',tm:'#8b949e',bdr:'#30363d',acc:'#3b82f6',grn:'#10b981',red:'#ef4444'};
  var inpS={width:'100%',padding:'9px 12px',background:C.bgIn,border:'1px solid '+C.bdr,borderRadius:'6px',color:C.text,fontSize:'13px',fontFamily:"'Inter',sans-serif",outline:'none',boxSizing:'border-box'};
  var selS=Object.assign({},inpS,{cursor:'pointer',appearance:'none',backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238b949e'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",backgroundRepeat:'no-repeat',backgroundPosition:'right 8px center',backgroundSize:'14px',paddingRight:'32px'});
  var lblS={fontSize:'12px',fontWeight:'600',color:C.tm,marginBottom:'4px',display:'block'};

  var uf = function(key,val){setForm(function(f){return Object.assign({},f,{[key]:val});});};

  // Custom fields helpers
  var addField = function(){setForm(function(f){return Object.assign({},f,{customFields:f.customFields.concat([{label:'',value:''}])});});};
  var removeField = function(idx){setForm(function(f){return Object.assign({},f,{customFields:f.customFields.filter(function(_,i){return i!==idx;})});});};
  var updateField = function(idx,key,val){setForm(function(f){var cf=f.customFields.map(function(field,i){return i===idx?Object.assign({},field,{[key]:val}):field;});return Object.assign({},f,{customFields:cf});});};

  var renderForm = function(){
    var typeFields = null;

    if(form.type==='bank'){
      typeFields = React.createElement('div', null,
        React.createElement('h4', {style:{fontSize:'13px',fontWeight:'600',color:C.text,margin:'16px 0 12px'}}, 'Payment Details'),
        React.createElement('div', {style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}},
          React.createElement('div', null, React.createElement('label',{style:lblS},'\uD83C\uDFE6 Bank Name *'), React.createElement('input',{style:Object.assign({},inpS,errors.bankName?{borderColor:C.red}:{}),value:form.bankName,onChange:function(e){uf('bankName',e.target.value);},placeholder:'Enter bank name'}), errors.bankName&&React.createElement('span',{style:{fontSize:'11px',color:C.red}},errors.bankName)),
          React.createElement('div', null, React.createElement('label',{style:lblS},'\uD83D\uDCCD Bank Branch'), React.createElement('input',{style:inpS,value:form.branch,onChange:function(e){uf('branch',e.target.value);},placeholder:'Enter bank branch'}))
        ),
        React.createElement('div', {style:{marginBottom:'12px'}},
          React.createElement('label',{style:lblS},'\uD83D\uDCCD Bank Address'), React.createElement('input',{style:inpS,value:form.address,onChange:function(e){uf('address',e.target.value);},placeholder:'Enter bank address'})
        ),
        React.createElement('div', {style:{marginBottom:'12px'}},
          React.createElement('label',{style:lblS},'\uD83D\uDCBC Account Name *'), React.createElement('input',{style:Object.assign({},inpS,errors.accountName?{borderColor:C.red}:{}),value:form.accountName,onChange:function(e){uf('accountName',e.target.value);},placeholder:'Enter account holder name'}), errors.accountName&&React.createElement('span',{style:{fontSize:'11px',color:C.red}},errors.accountName)
        ),
        React.createElement('div', {style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}},
          React.createElement('div', null, React.createElement('label',{style:lblS},'# Account Number *'), React.createElement('input',{style:Object.assign({},inpS,errors.accountNumber?{borderColor:C.red}:{}),value:form.accountNumber,onChange:function(e){uf('accountNumber',e.target.value);},placeholder:'Enter account number'}), errors.accountNumber&&React.createElement('span',{style:{fontSize:'11px',color:C.red}},errors.accountNumber)),
          React.createElement('div', null, React.createElement('label',{style:lblS},'\uD83C\uDFE6 Routing Number'), React.createElement('input',{style:inpS,value:form.routing,onChange:function(e){uf('routing',e.target.value);},placeholder:'Enter routing number'}))
        ),
        React.createElement('div', {style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px',marginBottom:'12px'}},
          React.createElement('div', null, React.createElement('label',{style:lblS},'\u2194 Sort Code'), React.createElement('input',{style:inpS,value:form.sortCode,onChange:function(e){uf('sortCode',e.target.value);},placeholder:'00-00-00'})),
          React.createElement('div', null, React.createElement('label',{style:lblS},'\u2194 SWIFT Code'), React.createElement('input',{style:inpS,value:form.swift,onChange:function(e){uf('swift',e.target.value);},placeholder:'ABCDUS33'})),
          React.createElement('div', null, React.createElement('label',{style:lblS},'\u2194 IBAN'), React.createElement('input',{style:inpS,value:form.iban,onChange:function(e){uf('iban',e.target.value);},placeholder:'GB00 ABCD 0000 0000 0000 00'}))
        )
      );
    } else if(form.type==='paypal'){
      typeFields = React.createElement('div', {style:{margin:'16px 0 12px'}},
        React.createElement('h4', {style:{fontSize:'13px',fontWeight:'600',color:C.text,margin:'0 0 12px'}}, 'Payment Details'),
        React.createElement('label',{style:lblS},'\u2709 PayPal Email *'),
        React.createElement('input',{style:Object.assign({},inpS,errors.paypalEmail?{borderColor:C.red}:{}),value:form.paypalEmail,onChange:function(e){uf('paypalEmail',e.target.value);},placeholder:'payments@company.com',type:'email'}),
        errors.paypalEmail&&React.createElement('span',{style:{fontSize:'11px',color:C.red}},errors.paypalEmail)
      );
    } else if(form.type==='crypto'){
      typeFields = React.createElement('div', {style:{margin:'16px 0 12px'}},
        React.createElement('h4', {style:{fontSize:'13px',fontWeight:'600',color:C.text,margin:'0 0 12px'}}, 'Payment Details'),
        React.createElement('div', {style:{display:'grid',gridTemplateColumns:'1fr 2fr',gap:'12px'}},
          React.createElement('div', null, React.createElement('label',{style:lblS},'\uD83D\uDCB0 Currency *'),
            React.createElement('select',{style:selS,value:form.cryptoCurrency,onChange:function(e){uf('cryptoCurrency',e.target.value);}},
              CRYPTOS.map(function(c){return React.createElement('option',{key:c,value:c},c);})
            )
          ),
          React.createElement('div', null, React.createElement('label',{style:lblS},'\uD83D\uDD11 Wallet Address *'),
            React.createElement('input',{style:Object.assign({},inpS,errors.walletAddress?{borderColor:C.red}:{}),value:form.walletAddress,onChange:function(e){uf('walletAddress',e.target.value);},placeholder:'Enter wallet address'}),
            errors.walletAddress&&React.createElement('span',{style:{fontSize:'11px',color:C.red}},errors.walletAddress)
          )
        )
      );
    } else if(form.type==='custom'){
      typeFields = React.createElement('div', {style:{margin:'16px 0 12px'}},
        React.createElement('h4', {style:{fontSize:'13px',fontWeight:'600',color:C.text,margin:'0 0 12px'}}, 'Payment Details'),
        React.createElement('div', {style:{background:'#0d1117',border:'1px solid '+C.bdr,borderRadius:'8px',padding:'16px'}},
          React.createElement('div', {style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}},
            React.createElement('span', {style:{fontSize:'13px',fontWeight:'600',color:C.text}}, 'Custom Fields'),
            React.createElement('button', {onClick:addField,style:{padding:'5px 12px',background:C.grn,border:'none',borderRadius:'6px',color:'#fff',fontSize:'12px',fontWeight:'600',cursor:'pointer'}}, '+ Add Field')
          ),
          form.customFields.length>0 && React.createElement('div', {style:{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:'8px',marginBottom:'4px'}},
            React.createElement('span',{style:{fontSize:'11px',fontWeight:'600',color:C.tm}},'\uD83C\uDFF7 Label'),
            React.createElement('span',{style:{fontSize:'11px',fontWeight:'600',color:C.tm}},'# Value'),
            React.createElement('span',{style:{width:'28px'}})
          ),
          form.customFields.map(function(f,i){
            return React.createElement('div', {key:i,style:{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:'8px',marginBottom:'8px'}},
              React.createElement('input',{style:inpS,value:f.label,onChange:function(e){updateField(i,'label',e.target.value);},placeholder:'e.g., Venmo Username'}),
              React.createElement('input',{style:inpS,value:f.value,onChange:function(e){updateField(i,'value',e.target.value);},placeholder:'e.g., @company'}),
              React.createElement('button',{onClick:function(){removeField(i);},style:{width:'28px',height:'36px',background:'#ef444420',border:'1px solid #ef444440',borderRadius:'6px',color:C.red,cursor:'pointer',fontSize:'14px',display:'flex',alignItems:'center',justifyContent:'center'}},'\u2715')
            );
          })
        )
      );
    }

    return React.createElement('div', null,
      // Type + Name row
      React.createElement('div', {style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}},
        React.createElement('div', null,
          React.createElement('label',{style:lblS},'\u2699 Payment Method Type *'),
          React.createElement('select',{style:selS,value:form.type,onChange:function(e){uf('type',e.target.value);}},
            TYPES.map(function(t){return React.createElement('option',{key:t.value,value:t.value},t.label);})
          )
        ),
        React.createElement('div', null,
          React.createElement('label',{style:lblS},'\uD83C\uDFF7 Payment Method Name *'),
          React.createElement('input',{style:Object.assign({},inpS,errors.name?{borderColor:C.red}:{}),value:form.name,onChange:function(e){uf('name',e.target.value);},placeholder:'e.g., Main Business Account, PayPal Business',maxLength:100}),
          errors.name&&React.createElement('span',{style:{fontSize:'11px',color:C.red}},errors.name)
        )
      ),
      typeFields,
      // Settings
      React.createElement('div', {style:{margin:'20px 0 16px'}},
        React.createElement('h4', {style:{fontSize:'13px',fontWeight:'600',color:C.text,margin:'0 0 12px'}}, 'Settings'),
        React.createElement('label', {style:{display:'flex',alignItems:'center',gap:'10px',padding:'10px 12px',background:'#0d1117',border:'1px solid '+C.bdr,borderRadius:'6px',cursor:'pointer',marginBottom:'8px'}},
          React.createElement('input',{type:'checkbox',checked:form.active,onChange:function(){uf('active',!form.active);},style:{accentColor:C.grn,width:'16px',height:'16px'}}),
          React.createElement('span',{style:{fontSize:'13px',color:C.text,fontWeight:'500'}},'Active Payment Method')
        ),
        React.createElement('label', {style:{display:'flex',alignItems:'center',gap:'10px',padding:'10px 12px',background:'#0d1117',border:'1px solid '+C.bdr,borderRadius:'6px',cursor:'pointer'}},
          React.createElement('input',{type:'checkbox',checked:form.isDefault,onChange:function(){uf('isDefault',!form.isDefault);},style:{accentColor:C.grn,width:'16px',height:'16px'}}),
          React.createElement('span',{style:{fontSize:'13px',color:C.text,fontWeight:'500'}},'Set as Default Payment Method')
        )
      ),
      // Save button
      React.createElement('button', {onClick:handleSave, style:{width:'100%',padding:'11px',background:C.grn,border:'none',borderRadius:'6px',color:'#fff',fontSize:'14px',fontWeight:'600',cursor:'pointer'}},
        editing ? 'Save Changes' : 'Create Payment Method'
      )
    );
  };

  // Close actions on outside click
  useEffect(function(){
    if(!actionsOpen) return;
    var handler=function(){setActionsOpen(null);};
    document.addEventListener('click',handler);
    return function(){document.removeEventListener('click',handler);};
  },[actionsOpen]);

  return React.createElement('div', {style:{padding:isMobile?'16px':'24px',fontFamily:"'Inter',sans-serif"}},
    // Header
    React.createElement('div', {style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px',flexWrap:'wrap',gap:'10px'}},
      React.createElement('div', null,
        React.createElement('h1', {style:{fontSize:'22px',fontWeight:'700',color:C.text,margin:0}}, 'Payment Methods'),
        React.createElement('p', {style:{fontSize:'14px',color:C.tm,marginTop:'4px'}}, 'Manage saved payment methods for your invoices')
      ),
      React.createElement('button', {onClick:openCreate, style:{padding:'9px 16px',background:C.grn,border:'none',borderRadius:'6px',color:'#fff',fontSize:'13px',fontWeight:'600',cursor:'pointer',whiteSpace:'nowrap'}}, '+ Add Payment Method')
    ),
    // Table
    React.createElement('div', {style:{background:C.bgCard,borderRadius:'8px',border:'1px solid '+C.bdr,overflow:'hidden'}},
      methods.length > 0 ?
        React.createElement('div', {style:{overflowX:'auto'}},
          React.createElement('table', {style:{width:'100%',borderCollapse:'collapse',fontSize:'13px',minWidth:isMobile?'600px':'auto'}},
            React.createElement('thead', null,
              React.createElement('tr', {style:{borderBottom:'1px solid '+C.bdr}},
                ['\uD83D\uDCBC Payment Name','Type','Details','Status','Default','Actions'].map(function(h){
                  return React.createElement('th',{key:h,style:{padding:'10px 14px',textAlign:'left',color:C.tm,fontWeight:'600',fontSize:'12px',whiteSpace:'nowrap'}},h);
                })
              )
            ),
            React.createElement('tbody', null,
              methods.map(function(m){
                var typeInfo = TYPES.find(function(t){return t.value===m.type;})||TYPES[0];
                return React.createElement('tr', {key:m.id, style:{borderBottom:'1px solid '+C.bdr,transition:'background 0.15s'},
                  onMouseEnter:function(e){e.currentTarget.style.background='#1c2333';},
                  onMouseLeave:function(e){e.currentTarget.style.background='transparent';}
                },
                  React.createElement('td', {style:{padding:'12px 14px',color:C.text,fontWeight:'600'}}, m.name),
                  React.createElement('td', {style:{padding:'12px 14px'}},
                    React.createElement('span', {style:{padding:'3px 10px',borderRadius:'4px',fontSize:'11px',fontWeight:'600',color:'#fff',background:typeInfo.color}}, typeInfo.label)
                  ),
                  React.createElement('td', {style:{padding:'12px 14px',color:C.tm,fontSize:'12px',maxWidth:'200px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}, getDetails(m)),
                  React.createElement('td', {style:{padding:'12px 14px'}},
                    React.createElement('span', {style:{padding:'2px 8px',borderRadius:'4px',fontSize:'11px',fontWeight:'600',color:m.active!==false?C.grn:C.tm}}, m.active!==false?'Active':'Inactive')
                  ),
                  React.createElement('td', {style:{padding:'12px 14px',textAlign:'center'}},
                    React.createElement('button', {onClick:function(e){e.stopPropagation();toggleDefault(m);}, style:{background:'none',border:'none',cursor:'pointer',fontSize:'18px',color:m.isDefault?'#f59e0b':C.tm}}, m.isDefault?'\u2605':'\u2606')
                  ),
                  React.createElement('td', {style:{padding:'12px 14px',position:'relative'}},
                    React.createElement('button', {onClick:function(e){e.stopPropagation();setActionsOpen(actionsOpen===m.id?null:m.id);}, style:{background:'none',border:'none',color:C.tm,cursor:'pointer',fontSize:'18px',padding:'2px 6px'}}, '\u2026'),
                    actionsOpen===m.id && React.createElement('div', {style:{position:'absolute',right:'14px',top:'38px',background:'#161b22',border:'1px solid '+C.bdr,borderRadius:'8px',boxShadow:'0 8px 24px rgba(0,0,0,0.3)',zIndex:10,minWidth:'140px',overflow:'hidden'}},
                      React.createElement('button', {onClick:function(){openEdit(m);}, style:{width:'100%',padding:'8px 14px',background:'none',border:'none',borderBottom:'1px solid '+C.bdr,color:C.text,fontSize:'12px',cursor:'pointer',textAlign:'left'}}, '\u270E Edit'),
                      React.createElement('button', {onClick:function(){toggleActive(m);setActionsOpen(null);}, style:{width:'100%',padding:'8px 14px',background:'none',border:'none',borderBottom:'1px solid '+C.bdr,color:C.text,fontSize:'12px',cursor:'pointer',textAlign:'left'}}, m.active!==false?'Deactivate':'Activate'),
                      React.createElement('button', {onClick:function(){setDelConfirm(m);setActionsOpen(null);}, style:{width:'100%',padding:'8px 14px',background:'none',border:'none',color:C.red,fontSize:'12px',cursor:'pointer',textAlign:'left'}}, '\uD83D\uDDD1 Delete')
                    )
                  )
                );
              })
            )
          )
        )
      : React.createElement('div', {style:{textAlign:'center',padding:'60px 20px'}},
          React.createElement('div', {style:{fontSize:'48px',marginBottom:'12px',opacity:0.5}}, '\uD83D\uDCB3'),
          React.createElement('div', {style:{fontSize:'16px',fontWeight:'600',color:C.text,marginBottom:'6px'}}, 'No payment methods'),
          React.createElement('div', {style:{fontSize:'13px',color:C.tm}}, 'Add a payment method to display on your invoices.')
        )
    ),
    // Modals
    React.createElement(Modal, {open:showModal, onClose:function(){setShowModal(false);}, title:editing?'Edit Payment Method':'Create New Payment Method', subtitle:editing?'Update payment method details.':'Add a new payment method to your organization. This will be available when creating invoices.'}, renderForm()),
    React.createElement(ConfirmDialog, {open:!!delConfirm, onClose:function(){setDelConfirm(null);}, onConfirm:confirmDel, title:'Delete Payment Method', message:'Are you sure you want to delete this payment method? This action cannot be undone.'})
  );
}
