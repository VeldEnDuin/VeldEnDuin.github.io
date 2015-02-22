<!-- links enabled -->
{% for m1 in site.data.menu %}
    {% assign code = m1.linkcode %}
    {% if code %}
        {% for langlink in m1.menu %}
[{{code}}.{{langlink[0]}}]: {{langlink[1].link}}
        {% endfor %}
    {% endif %}
    {% for m2 in m1.submenu %}
        {% assign code = m2.linkcode %}
        {% if code %}
            {% for langlink in m2.item %}
[{{code}}.{{langlink[0]}}]: {{langlink[1].link}}
            {% endfor %}
        {% endif %}
    {% endfor %}
{% endfor %}

{% for link in site.data.linkcode %}
    {% assign code = link[0] %}
    {% for langlink in link[1] %}
[{{code}}.{{langlink[0]}}]: {{langlink[1].link}}
    {% endfor %}
{% endfor %}