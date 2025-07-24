document.addEventListener('DOMContentLoaded', () => {
  let slides = [];
  let selected = null;
  const slideList = document.getElementById('slide-list');
  const formContainer = document.getElementById('form-container');
  const addBtn = document.getElementById('add-slide');
  const importInput = document.getElementById('import-input');
  const exportBtn = document.getElementById('export-btn');
  const defaultFooter = document.getElementById('default-footer');
  const fontScale = document.getElementById('font-scale');

  const DEFAULTS = {
    title: {type:'title', title:'Title', author:'', date:''},
    list: {type:'list', title:'List', ordered:true, content:[]},
    code: {type:'code', title:'Code', code:''},
    image: {type:'image', title:'Image'},
    video: {type:'video', title:'Video'},
    pointCloud:{type:'pointCloud', title:'Point Cloud'},
    end:{type:'end', title:'End'}
  };

  const FIELDS = {
    title:['header','title','author','date','footerText','notes'],
    list:['header','title','ordered','content','footerText','notes'],
    code:['header','title','subTitle','text','language','code','footerText','notes'],
    image:['header','title','imageSrc','caption','math','fileInputId','zoomable','footerText','notes'],
    video:['header','title','videoId','fileInputId','caption','zoomable','footerText','notes'],
    pointCloud:['header','title','points','pointCloudSrc','useVertexColors','caption','fileInputId','zoomable','footerText','notes'],
    end:['header','title','footerText','notes']
  };

  function renderList(){
    slideList.innerHTML='';
    slides.forEach((s,i)=>{
      const li=document.createElement('li');
      li.textContent=`${i+1}: ${s.type}`;
      li.style.cursor='pointer';
      if(i===selected) li.style.fontWeight='bold';
      li.addEventListener('click',()=>{selected=i;renderList();renderForm();});
      slideList.appendChild(li);
    });
  }

  function renderForm(){
    formContainer.innerHTML='';
    if(selected===null) return;
    const s=slides[selected];
    const fields=FIELDS[s.type]||[];
    fields.forEach(field=>{
      const value=s[field];
      const label=document.createElement('label');
      label.textContent=field;
      const input=document.createElement(field==='notes'||field==='code'||field==='content'?'textarea':'input');
      if(typeof value==='boolean'){
        input.type='checkbox';
        input.checked=!!value;
      }else if(typeof value==='number'){
        input.type='number';
        input.value=value;
      }else{
        input.value=value||'';
      }
      input.addEventListener('input',()=>{
        if(input.type==='checkbox'){
          s[field]=input.checked;
        }else if(field==='content'){
          try{ s[field]=jsyaml.load(input.value)||[]; }catch(e){}
        }else if(typeof value==='number'){
          s[field]=parseFloat(input.value);
        }else{
          s[field]=input.value;
        }
      });
      label.appendChild(input);
      formContainer.appendChild(label);
      formContainer.appendChild(document.createElement('br'));
    });
    const del=document.createElement('button');
    del.textContent='Remove Slide';
    del.addEventListener('click',()=>{slides.splice(selected,1);selected=null;renderList();renderForm();});
    formContainer.appendChild(del);
  }

  addBtn.addEventListener('click',()=>{
    const type=prompt('Slide type (title,list,code,image,video,pointCloud,end)');
    if(!type||!DEFAULTS[type]) return;
    slides.push(JSON.parse(JSON.stringify(DEFAULTS[type])));
    selected=slides.length-1;
    renderList();
    renderForm();
  });

  importInput.addEventListener('change',e=>{
    const file=e.target.files[0];
    if(!file) return;
    const reader=new FileReader();
    reader.onload=()=>{
      const data=jsyaml.load(reader.result);
      slides=data.editableSlides||[];
      defaultFooter.value=data.defaultFooterText||'';
      fontScale.value=data.fontScale||'';
      selected=null;
      renderList();renderForm();
    };
    reader.readAsText(file);
  });

  exportBtn.addEventListener('click',()=>{
    const data={
      defaultFooterText: defaultFooter.value||undefined,
      fontScale: fontScale.value?parseFloat(fontScale.value):undefined,
      editableSlides: slides
    };
    const yaml=jsyaml.dump(data);
    const blob=new Blob([yaml],{type:'text/yaml'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='slides.yaml';
    a.click();
    URL.revokeObjectURL(a.href);
  });

});
