(async()=>{
 const slug=new URLSearchParams(location.search).get('shop')||location.pathname.split('/').filter(Boolean).pop();
 const items=document.getElementById('items'),heading=document.getElementById('shopName');
 if(!/^[a-z0-9-]{5,48}$/.test(slug)){heading.textContent='Vitrin bulunamadı';return}
 try{
  const response=await fetch('/api/jewelry?action=catalog&slug='+encodeURIComponent(slug),{cache:'no-store'}),data=await response.json();
  if(!response.ok||!data.ok)throw Error('not_found');
  heading.textContent=data.shop.name;document.title=data.shop.name+' · VERTEX Koleksiyon';document.getElementById('shopTagline').textContent=data.shop.tagline||'Ürünleri inceleyin; ayrıntılar için mağazayla iletişime geçin.';
  if(!data.products.length){items.textContent='Henüz yayımlanmış ürün yok.';return}
  const labels={yuzuk:'Yüzük',kupe:'Küpe',kolye:'Kolye',bilezik:'Bilezik',diger:'Mücevher'};
  for(const p of data.products){
   const card=document.createElement('article');card.className='item';
   const img=document.createElement('img');img.src=p.image;img.alt=p.title;img.loading='lazy';card.append(img);
   const copy=document.createElement('div');copy.className='item-copy';
   const category=document.createElement('small');category.textContent=labels[p.category]||'Mücevher';
   const title=document.createElement('h2');title.textContent=p.title;
   const detail=document.createElement('p');detail.textContent=p.description||'Ürün detayları için iletişime geçin.';
   copy.append(category,title,detail);
   if(/^\d{10,15}$/.test(data.shop.whatsapp||'')){
    const link=document.createElement('a');link.href='https://wa.me/'+data.shop.whatsapp+'?text='+encodeURIComponent(p.title+' hakkında bilgi almak istiyorum.');link.target='_blank';link.rel='noopener noreferrer';link.textContent='WhatsApp ile sor →';copy.append(link);
   }
   card.append(copy);items.append(card);
  }
 }catch{heading.textContent='Vitrin henüz yayında değil';items.textContent='Bu koleksiyona şu anda ulaşılamıyor.'}
})();
