function highlightThis(event){var backgroundColor=this.style.backgroundColor;this.style.backgroundColor="yellow",alert(this.className),this.style.backgroundColor=backgroundColor}for(var divs=document.getElementsByClassName("alert"),i=0;i<divs.length;i++)divs[i].addEventListener("click",highlightThis);$(document).bind("submit",function(ev){ev.preventDefault(),console.log("Submit for form intercepted")});