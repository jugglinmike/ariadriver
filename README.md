# ariadriver

A Node.js library for testing web applications using WebDriver and ARIA

## Explanation

[WAI-ARIA](https://w3c.github.io/aria/) and
[WebDriver](https://w3c.github.io/webdriver/) are two distinct web standards
with highly similar goals: they both aim to enable machine-mediated interaction
with web pages. In the case of ARIA, the machine is some Assistive Technology
(e.g. a screen reader or a braille display), and it enables a person with a
disability to effectively browse the web. In the case of WebDriver, the machine
is a script written by a web developer, and it enables the developer to verify
the correctness of their work.

                                                 .--------------.
                                                 | Application  |
                                                 +----------.   |
    Developer --> page objects ---> WebDriver -->| HTML     |   |
                                                 +------.   |   |
    User ---------> Asssive Technology --------->| ARIA |   |   |
                                                 '------+---+---'

The differences in the paths used by developers and users to access web
applications cause a number of problems. Web developers have little
insight into the correctness of their application from the perspective
of a visitor using Assistive Technology. Instead, they typically build a
separate layer to facilitate testing, comprised of so-called ["page
objects"](http://elementalselenium.com/tips/7-use-a-page-object). This
layer commonly circumvents the patterns used by Assistive Technology.
Maintaining it is a drain on their time and attention, and it only
indirectly benefits the people who use the application (i.e. by enabling
a limited form of testing).

The goal of the AriaDriver project is to converge the paths that developers and
users take to reach web applications. By giving developers a more wholistic
view into their own applications, AriaDriver can help web authors create more
accessible applications. By implementing [accessible user interface
patterns](https://w3c.github.io/aria-practices/), AriaDriver can also reduce
the need for custom testing logic and improve test stability.

                                                 .--------------.
                                                 | Application  |
                                                 +----------.   |
    Developer -------> AriaDriver -------.       | HTML     |   |
                                          \      +------.   |   |
    User ---------> Asssive Technology --------->| ARIA |   |   |
                                                 '------+---+---'

## Standardization

Although a Node.js library such as this may be useful for some developers, its
benefits could be magnified through standardization. If the API offered by this
library were instead defined as "commands" in the W3C WebDriver specification,
then:

- future enhancements could be wholistically designed by the experts who
  contribute to the relevant standards, that is: [the Browser Testing and Tools
  Working Group](https://www.w3.org/testing/browser/) and [the Web
  Accessibility Initiative](https://www.w3.org/WAI/)
- the practice of accessibility-driven testing would be recognized by more
  developers and (thanks to the language-agnostic design of the WebDriver
  protocol) usable from more projects
- operations would be more efficient because fewer instructions would have to
  be sent "over the wire" of the WebDriver protocol

## License

Copyright 2017 Mike Pennisi under [the GNU General Public License
v3.0](https://www.gnu.org/licenses/gpl-3.0.html)
