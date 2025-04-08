
const toggleThemeBtn = document.querySelector('.header__theme-button');
const storiesContent = document.querySelector('.stories__content');
const storiesLeftButton = document.querySelector('.stories__left-button');
const storiesRightButton = document.querySelector('.stories__right-button');
const posts = document.querySelectorAll('.post');
const postsContent = document.querySelectorAll('.post__content');
let last = +new Date();

// Toggle theme button
toggleThemeBtn.addEventListener('click', () => {
  // Toggle root class
  document.documentElement.classList.toggle('darkTheme');

  // Saving current theme on LocalStorage
  if (document.documentElement.classList.contains('darkTheme')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
});

// ===================================
// STORIES SCROLL BUTTONS
// Scrolling stories content
storiesLeftButton.addEventListener('click', () => {
  storiesContent.scrollLeft -= 320;
});
storiesRightButton.addEventListener('click', () => {
  storiesContent.scrollLeft += 320;
});

// Checking if screen has minimun size of 1024px
if (window.matchMedia('(min-width: 1024px)').matches) {
  // Observer to hide buttons when necessary
  const storiesObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach((entry) => {
        if (entry.target === document.querySelector('.story:first-child')) {
          storiesLeftButton.style.display = entry.isIntersecting
            ? 'none'
            : 'unset';
        } else if (
          entry.target === document.querySelector('.story:last-child')
        ) {
          storiesRightButton.style.display = entry.isIntersecting
            ? 'none'
            : 'unset';
        }
      });
    },
    { root: storiesContent, threshold: 1 }
  );

  // Calling the observer with the first and last stories
  let firstStory = document.querySelector('.story:first-child');
  let lastStory = document.querySelector('.story:last-child');
  if (firstStory) {
    storiesObserver.observe(firstStory);
  }
  if (lastStory) {
    storiesObserver.observe(lastStory);
  }
}

// ===================================
// POST MULTIPLE MEDIAS
// Creating scroll buttons and indicators when post has more than one media
posts.forEach((post) => {
  if (post.querySelectorAll('.post__media').length > 1) {
    const leftButtonElement = document.createElement('button');
    leftButtonElement.setAttribute('title', 'leftwards');
    leftButtonElement.classList.add('post__left-button');
    leftButtonElement.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path fill="#fff" d="M256 504C119 504 8 393 8 256S119 8 256 8s248 111 248 248-111 248-248 248zM142.1 273l135.5 135.5c9.4 9.4 24.6 9.4 33.9 0l17-17c9.4-9.4 9.4-24.6 0-33.9L226.9 256l101.6-101.6c9.4-9.4 9.4-24.6 0-33.9l-17-17c-9.4-9.4-24.6-9.4-33.9 0L142.1 239c-9.4 9.4-9.4 24.6 0 34z"></path>
      </svg>
    `;

    const rightButtonElement = document.createElement('button');
    rightButtonElement.setAttribute('title', 'rightwards');
    rightButtonElement.classList.add('post__right-button');
    rightButtonElement.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path fill="#fff" d="M256 8c137 0 248 111 248 248S393 504 256 504 8 393 8 256 119 8 256 8zm113.9 231L234.4 103.5c-9.4-9.4-24.6-9.4-33.9 0l-17 17c-9.4 9.4-9.4 24.6 0 33.9L285.1 256 183.5 357.6c-9.4 9.4-9.4 24.6 0 33.9l17 17c9.4 9.4 24.6 9.4 33.9 0L369.9 273c9.4-9.4 9.4-24.6 0-34z"></path>
      </svg>
    `;

    post.querySelector('.post__content').appendChild(leftButtonElement);
    post.querySelector('.post__content').appendChild(rightButtonElement);

    post.querySelectorAll('.post__media').forEach(function (mediaItem, i) {
      const postMediaIndicatorElement = document.createElement('div');
      postMediaIndicatorElement.classList.add('post__indicator');
      //postMediaIndicatorElement.classList.add('post__indicator--active');
      if (0 == i) {

        postMediaIndicatorElement.classList.add('post__indicator--active');
      }
      post
        .querySelector('.post__indicators')
        .appendChild(postMediaIndicatorElement);
    });

    // Observer to change the actual media indicator
    const postMediasContainer = post.querySelector('.post__medias');
    const postMediaIndicators = post.querySelectorAll('.post__indicator');
    const postIndicatorObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Removing all the indicators
            postMediaIndicators.forEach((indicator) =>
              indicator.classList.remove('post__indicator--active')
            );
            // Adding the indicator that matches the current post media
            postMediaIndicators[
              Array.from(postMedias).indexOf(entry.target)
            ].classList.add('post__indicator--active');
          }
        });
      },
      { root: postMediasContainer, threshold: 0.5 }
    );

    // Calling the observer for every post media
    const postMedias = post.querySelectorAll('.post__media');
    postMedias.forEach((media, i) => {

      postIndicatorObserver.observe(media);

    });
  }


  //binding comment form submit
  //submitting comment
  var commentForms = post.querySelectorAll('.post__comment-form');
  commentForms.forEach((form) => {
    form.onsubmit = function (event) {
      event.preventDefault();
      const now = +new Date();
      //request rate limiting
      if (now - last < 5000) { // 5 seconds
        return;
      }
      last = now;
      var formData = new FormData(form);
      form.reset();
      var comments = post.querySelector('.post__comments');
      comments.style.display = '';
      const options = {
        method: 'POST',
        body: formData,
        // signal: controller.signal,
        // If you add this, upload won't work
        // headers: {
        //   'Content-Type': 'multipart/form-data',
        // }
      };

      fetch(form.action, options)
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('get comments failed');
        })
        .then((data) => {
          if (data.success == true) {
            var ul = comments.querySelector('ul');
            while (ul.firstChild) {
              ul.removeChild(ul.lastChild);
            }
            data.items.forEach((item) => {
              var newLi = document.createElement('li');
              var nameElement = document.createElement('strong');
              nameElement.textContent = item.name;
              newLi.appendChild(nameElement)
              var contentElement = document.createElement('span');
              contentElement.textContent = item.content;
              newLi.appendChild(contentElement);
              ul.appendChild(newLi);
            })
            comments.className = comments.className.replace('is-loading', 'is-loaded');
            ul.scrollTop = ul.scrollHeight//scroll to bottom
          } else if (data.success == false) {
            comments.style.display = 'none';
          }
        })
        .catch((error) => {
          comments.style.display = 'none';
        });

    }
  });
});

// Adding buttons features on every post with multiple medias
postsContent.forEach((post) => {
  if (post.querySelectorAll('.post__media').length > 1) {
    const leftButton = post.querySelector('.post__left-button');
    const rightButton = post.querySelector('.post__right-button');
    const postMediasContainer = post.querySelector('.post__medias');

    // Functions for left and right buttons
    leftButton.addEventListener('click', () => {
      postMediasContainer.scrollLeft -= 400;
    });
    rightButton.addEventListener('click', () => {
      postMediasContainer.scrollLeft += 400;
    });

    // Observer to hide button if necessary
    const postButtonObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach((entry) => {
          if (entry.target === post.querySelector('.post__media:first-child')) {
            leftButton.style.display = entry.isIntersecting ? 'none' : 'unset';
          } else if (
            entry.target === post.querySelector('.post__media:last-child')
          ) {
            rightButton.style.display = entry.isIntersecting ? 'none' : 'unset';
          }
        });
      },
      { root: postMediasContainer, threshold: 0.5 }
    );

    if (window.matchMedia('(min-width: 1024px)').matches) {
      postButtonObserver.observe(
        post.querySelector('.post__media:first-child')
      );
      postButtonObserver.observe(post.querySelector('.post__media:last-child'));
    }
  }
});



//like button number change
var like_checkboxes = document.querySelectorAll(".post__footer .post__buttons .post__button .checkbox");
for (let i = 0; i < like_checkboxes.length; i++) {
  like_checkboxes[i].addEventListener('change', function () {
    if (this.checked) {
      var number_like = this.closest('.post__footer').
        querySelector('.post__likes .number_like');
      number_like.innerText = Number(number_like.innerText) + 1;
    } else {
      var number_like = this.closest('.post__footer').
        querySelector('.post__likes .number_like');
      number_like.innerText = Number(number_like.innerText) - 1;
    }
  });
}

function IsImageOk(img) {

  // During the onload event, IE correctly identifies any images that
  // weren’t downloaded as not complete. Others should too. Gecko-based
  // browsers act like NS4 in that they report this incorrectly.
  // if (!img.complete) {
  //   return false;
  // }

  if (!img.complete || !img.naturalWidth > 0) {
    return false;
  }

  // However, they do have two very useful properties: naturalWidth and
  // naturalHeight. These give the true size of the image. If it failed
  // to load, either of these should be zero.
  // if (img.naturalWidth === 0) {
  //   return false;
  // }

  // No other way of checking: assume it’s ok.
  return true;
}

document.addEventListener("DOMContentLoaded", function() {

  const firstImages = document.querySelectorAll(".post .post__content .post__medias .post__media:first-child img");
  firstImages.forEach(img => {
    img.addEventListener("load", () => {
      const loadingElement = img.closest('.is-loading');
      if (loadingElement) {
        loadingElement.classList.remove("is-loading");
      }
    });

    if (img.complete && (img.naturalWidth > 0 || img.naturalHeight > 0)) {
      const loadingElement = img.closest('.is-loading');
      if (loadingElement) {
        loadingElement.classList.remove("is-loading");
      }
    }
  });
});


function copyLink(button) {
  var article = button.closest(".post");
  var link = article.querySelector(".post__more-options").href;

  navigator.clipboard.writeText(link).then(function() {
      console.log('Link copied to clipboard!');
      // Show success message
      var message = document.createElement("div");
      message.classList.add("copy-success-message");
      message.textContent = "Link Copied!";
      article.appendChild(message);

      // Remove the message after a delay
      setTimeout(function() {
          article.removeChild(message);
          }, 2000); // Remove after 2 seconds

      }, function(err) {
      console.error('Could not copy link: ', err);
      });
}



function showComments(element) {
  var postFooterElement = element.closest('.post__footer');
  var commentsElement = postFooterElement.querySelector('.post__comments');

  if ('none' === commentsElement.style.display) {
    commentsElement.style.display = '';

    var ul = commentsElement.querySelector('ul');
    if (ul.querySelector('li')) {
      return;
    }

    var form = postFooterElement.querySelector('.post__comment-form');
    var formData = new FormData(form);

    const options = {
      method: 'POST',
      // body: JSON.stringify({ postId: postId }),
      body: formData,
      // signal: controller.signal,
      // If you add this, upload won't work
      // headers: {
      //   'Content-Type': 'multipart/form-data',
      // }

    };

    fetch('/Comment', options)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('get comments failed');
      })
      .then((data) => {

        if (data.success == true) {
          commentsElement.className = commentsElement.className.replace('is-loading', 'is-loaded');
          if (!data.items || data.items.length < 1) {
            var newLi = document.createElement('li');
            var contentElement = document.createElement('span');
            contentElement.textContent = "还没有评论，赶快评论吧";
            newLi.appendChild(contentElement);
            ul.appendChild(newLi);
            return;
          }
          data.items.forEach((item) => {
            var newLi = document.createElement('li');
            var nameElement = document.createElement('strong');
            nameElement.textContent = item.name;
            newLi.appendChild(nameElement)
            var contentElement = document.createElement('span');
            contentElement.textContent = item.content;
            newLi.appendChild(contentElement);
            ul.appendChild(newLi);
          })
        } else if (data.success == false) {

        }
      })
      .catch((error) => {
        commentsElement.style.display = 'none';
      });
  }
  else {
    commentsElement.style.display = 'none';
  }

}